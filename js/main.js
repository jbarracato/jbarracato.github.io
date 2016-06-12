// connect to your Firebase application using your reference URL
var apiAppRef = new Firebase('https://api-pulse-check.firebaseio.com/');
var originalUrl;
var pulseCheckUrl;
var chartCount200;
var chartCount300;
var chartCount400;
var chartCount500;


// jQuery Document
$(document).ready(function(){

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
    $('#cancel').click();
  });

  getApiList();

  //Get id of URL to delete
  $('#apiList').on('click', '.fa-trash', function () {
    var id = ($(this).parent().data('id'));
    deleteUrl(id);
  });

  //Delete a message
  function deleteUrl(id) {
    // find message whose objectId is equal to the id we're searching with
    var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id);
    urlRef.remove();
    $('li').attr('data-id',id).remove();
    getApiList();
  }

  //Get id of URL to edit
  $('#apiList').on('click', '.fa-gear', function () {
    var id = ($(this).parent().data('id'));
    editUrl(id);
  });

  //edit a message
  function editUrl(id) {
    // find message whose objectId is equal to the id we're searching with
    var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/url');
    urlRef.on('value', function(snapshot) {
      originalUrl = snapshot.val();
    });
    var editUrlPrompt = prompt ('Edit your URL:', originalUrl);
    var editedUrl = {url: editUrlPrompt};
    var newUrlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id);
    newUrlRef.update(editedUrl);
  }

  //Get id of URL to pulseCheck
  $('#apiList').on('click', '.fa-heartbeat', function () {
    var id = ($(this).parent().data('id'));
    var currentLine = $(this).parent();
    pulseCheck(id);
      //pulseCheck API
    function pulseCheck(id) {
      // find message whose objectId is equal to the id we're searching with
      var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/url');
      urlRef.on('value', function(snapshot) {
        pulseCheckUrl = snapshot.val();
        ajaxRequest(currentLine);
      });
    }
  });

  //Get id of URL for historical data
  $('#apiList').on('click', '.fa-line-chart', function () {
    var id = ($(this).parent().data('id'));
    getHistory(id);
  });

  //Get history
  function getHistory(id) {
    // find message whose objectId is equal to the id we're searching with
    var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count200');
    urlRef.on('value', function(snapshot) {
      chartCount200 = snapshot.val();
    });
    var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count300');
    urlRef.on('value', function(snapshot) {
      chartCount300 = snapshot.val();
    });
    var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count400');
    urlRef.on('value', function(snapshot) {
      chartCount400 = snapshot.val();
    });
    var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + '/count500');
    urlRef.on('value', function(snapshot) {
      chartCount500 = snapshot.val();
    });
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
        titleTextStyle: {fontSize: 20}
      };

      var chart = new google.visualization.PieChart(document.getElementById('piechart'));

      chart.draw(data, options);
    }
    $piechart.removeClass('none');
    $piechart.addClass('block');
  }

//close document.ready function on next line
});

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
var ajaxRequest = function (currentLine){$.ajax({
  url: pulseCheckUrl,
  complete: function(xhr, textStatus) {
    var apiStatus = xhr.status;
    var id = currentLine.data('id');
    if (apiStatus >= 200 && apiStatus < 300) {
      $(currentLine).addClass('green');
      var countType = '/count200';
      var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    } else if (apiStatus >= 300 && apiStatus < 400) {
      $(currentLine).addClass('orange');
      var countType = '/count300';
      var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    } else if (apiStatus >= 400 && apiStatus < 500) {
      $(currentLine).addClass('red');
      var countType = '/count400';
      var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    } else if (apiStatus >= 500 && apiStatus < 600) {
      $(currentLine).addClass('red');
      var countType = '/count500';
      var urlRef = new Firebase('https://api-pulse-check.firebaseio.com/savedApis/' + id + countType);
      setTimeout(function() {
        urlRef.transaction(function(statusCount) {
          return statusCount+1;
        });
      }, 500);
    }
  }
  });
};

//   *** modal js ***

// Get the modal
var $modal = $('#myModal');

// When the user clicks on the button, open the modal
$('#add').on('click', function () {
  $modal.removeClass('none');
  $modal.addClass('block');
});

// When the user clicks on <span> (x), close the modal
$('#cancel').on('click', function () {
  $modal.removeClass('block');
  $modal.addClass('none');
});

// *** pie chart ***

google.charts.load('current', {'packages':['corechart']});

// Get the pi echart
var $piechart = $('#piechartContainer');

$('#piechart').on('click', function () {
  $piechart.removeClass('block');
  $piechart.addClass('none');
});
