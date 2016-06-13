// connect to your Firebase application using your reference URL
var apiAppRef = new Firebase('https://api-pulse-check.firebaseio.com/');
//load the dependencies for drawing the pie chart from Google
google.charts.load('current', {'packages':['corechart']});

//Wait for the page to load before populating list/enabling event handlers
$(document).ready(function(){

  //Initial population of URL list
    getApiList();

// *** PRIMARY EVENT HANDLERS ***

  //Add new URL to Firebase
  $('#submit').on('click', function (event) {
    var apiName = $('#addApiName').val();
    var apiUrl = $('#addApiUrl').val();
    $('#addApiName').val('');
    $('#addApiUrl').val('');
    var apiRef = apiAppRef.child('savedApis');
    apiRef.push({
      name: apiName,
      url: apiUrl,
      count200: 0,
      count300: 0,
      count400: 0,
      count500: 0,
    });
    //Close modal when clicking cancel
    $('#cancel').click();
  });

  //Get id of URL to pulseCheck
  //NOTE: Need to keep track of current line so it can flash the correct color
  $('#apiList').on('click', '.fa-heartbeat', function () {
    var id = ($(this).parent().data('id'));
    var currentLine = $(this).parent();
    pulseCheck(id, currentLine);
  });

  //Get id of URL to edit
    $('#apiList').on('click', '.fa-gear', function () {
      var id = ($(this).parent().data('id'));
      editUrl(id);
    });

  //Get id of URL to delete
  $('#apiList').on('click', '.fa-trash', function () {
    var id = ($(this).parent().data('id'));
    deleteUrl(id);
  });

  //Get id of URL for historical data
  $('#apiList').on('click', '.fa-line-chart', function () {
    var id = ($(this).parent().data('id'));
    getHistory(id);
  });

//close document.ready function on next line
});

// *** ACCESS & MANIPULATE DATA IN FIREBASE
//pulseCheck URL
//NOTE: Need to keep track of current line so it can flash the correct color
function pulseCheck(id, currentLine) {
  // find message whose objectId is equal to the id we're searching with
  var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/url');
  urlRef.on('value', function(snapshot) {
    var pulseCheckUrl = snapshot.val();
    ajaxRequest(currentLine, pulseCheckUrl);
  });
}

//Delete URL from Firebase
function deleteUrl(id) {
  var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id);
  urlRef.remove();
  $('li').attr('data-id',id).remove();
  getApiList();
}

//Update URL in Firebase
function editUrl(id) {
  var originalUrl;
  var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/url');
  urlRef.on('value', function(snapshot) {
    originalUrl = snapshot.val();
  });
  var editUrlPrompt = prompt ('Edit your URL:', originalUrl);
  var editedUrl = {url: editUrlPrompt};
  var newUrlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id);
  newUrlRef.update(editedUrl);
}

//Get historical counts and draw chart
function getHistory(id) {
  // find message whose objectId is equal to the id we're searching with
  var chartCount200;
  var chartCount300;
  var chartCount400;
  var chartCount500;
  var urlRef;
  urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count200');
  urlRef.on('value', function(snapshot) {
    chartCount200 = snapshot.val();
  });
  urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count300');
  urlRef.on('value', function(snapshot) {
    chartCount300 = snapshot.val();
  });
  urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count400');
  urlRef.on('value', function(snapshot) {
    chartCount400 = snapshot.val();
  });
  urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count500');
  urlRef.on('value', function(snapshot) {
    chartCount500 = snapshot.val();
  });
  //start of code from Google + customization options
  //draw the chart using values Firebase requests above
  google.charts.setOnLoadCallback(drawChart);
  function drawChart() {
    var data = google.visualization.arrayToDataTable([
      ['Status', 'Count'],
      ['200', chartCount200],
      ['300', chartCount300],
      ['400', chartCount400],
      ['500', chartCount500]
    ]);
    var options = {
      title: 'Historical Performance',
      backgroundColor: '#fefefe',
      height: 500,
      legend: {position: 'bottom', textStyle: {fontSize: 20}},
      titleTextStyle: {fontSize: 20},
      pieSliceTextStyle: {color: 'black', fontSize: 20},
      slices: {0: {color: '#329832'}, 1: {color: '#ffff4c'}, 2: {color: '#de8732'}, 3: {color: '#c13232'}}
    };
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
  }
  //end of code from Google
  //pop the chart after drawing with the code from Google
  var $piechart = $('#piechartContainer');
  $piechart.removeClass('none');
  $piechart.addClass('block');
  //close the chart when clicking on it
  $('#piechart').on('click', function () {
    $piechart.removeClass('block');
    $piechart.addClass('none');
  });
}

//
function getApiList() {
  apiAppRef.child('savedApis').on('value', function (results) {
    var $apiList = $('#apiList');
    var apiArray = [];
    var allApis = results.val();
    for (var api in allApis) {
      var name = allApis[api].name;
      var $apiListElement = $('<li> <p class = "displayName">' + name + '</p>' + '<i class="fa fa-heartbeat run"></i><i class="fa fa-gear edit"></i><i class="fa fa-trash delete"></i><i class="fa fa-line-chart history"></i></li>');
      $apiListElement.attr('data-id', api);
      apiArray.push($apiListElement);
      $apiList.empty();
      for (var i in apiArray) {
        $apiList.append(apiArray[i]);
      }
    }
  });
}

//ajax request for pulseCheck
var ajaxRequest = function (currentLine, pulseCheckUrl){$.ajax({
  url: pulseCheckUrl,
  complete: function(xhr, textStatus) {
    var countType;
    var urlRef;
    var apiStatus = xhr.status;
    var id = currentLine.data('id');
    if (apiStatus >= 200 && apiStatus <= 299) {
      $(currentLine).addClass('green');
      countType = '/count200';
      urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    } else if (apiStatus >= 300 && apiStatus <= 399) {
      $(currentLine).addClass('yellow');
      countType = '/count300';
      urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    } else if (apiStatus >= 400 && apiStatus < 499) {
      $(currentLine).addClass('orange');
      countType = '/count400';
      urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    } else if (apiStatus >= 500 && apiStatus < 599) {
      $(currentLine).addClass('red');
      countType = '/count500';
      urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    }
  }
  });
};

// *** SECONDARY EVENT HANDLERS ***

// SHOW & HIDE 'ADD NEW URL' MODAL
// When the user clicks on the button, open the modal
var $modal = $('#myModal');
$('#add').on('click', function () {
  $modal.removeClass('none');
  $modal.addClass('block');
});
// When the user clicks on <span> (x), close the modal
$('#cancel').on('click', function () {
  $modal.removeClass('block');
  $modal.addClass('none');
});
