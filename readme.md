API PULSE CHECK
===============

### Table of Contents
* Introduction
* Technical Dependencies
* Configuration
* Enhancement Opportunities

Introduction
------------
API Pulse Check is a simple application to save urls for API calls and test for a 200 level response. Each pulse check is recorded, and the results over time can be viewed as a pie chart.

Technical Dependencies
----------------------
In addition to the javascript included in this repository, there are three 3rd party tools that enable this application to work correctly:

### [jQuery](https://jquery.com)

The javascript in this repository includes a number of jQuery selectors to keep code succinct and for ease of development. If desired, refactoring the code to use only vanilla javascript should be a straightforward endeavor.


### [Firebase](https://firebase.google.com)

This application is highly dependent on Firebase to store and retrieve urls for api pulse checks. Calls to Firebase have been abstracted, so setting the baseUrl variable to your own Firebase database will quickly enable you to get your own instance working. (See Configuration below.)


### [Google Chart](https://developers.google.com/chart/)

The pie chart of historical response statuses uses Google Chart to draw the chart based on information from Firebase. The code for the chart is self-contained(main.js:lines 184-204), and switching to a different tool to draw the chart should mostly depend on the new tool you choose.


Configuration
-------------
Setting up your own instance of this application only requires two updates to the javascript code:

1. baseUrl (main.js:line 3) -- set this to the url for your own Firebase; all subsequent references to Firebase will use this base to construct urls for database calls.
2. authentication url (main.js:line 103) -- set this to the url you want to use for authentication. If the site you're authenticating with returns additional parameters beyond the access_token, you will also need to update token (main.js:line 9) to exclude the extra information.


Enhancement Opportunities
-------------------------
1. Support multiple request types: currently all requests are 'GET'; adding support for multiple calls would require an update to the add modal (index.html:lines 26-48), the submit function (main.js: lines 25-59), as well as the pulseCheck function (main.js:lines 117-135) and the ajaxRequest function (main.js:lines 237-292).
2. Indication if authentication is required for a given url: currently, there is no UI element to alert the user that authentication is required to pulse check a url; adding support for this would require an update to the getApiList function (main.js:lines 218-234).
3. Support multiple authentication sources: would require a new modal to handle target selection; a way to track the different tokens; and associate the various token types with urls requiring authentication.
4. Support multiple users: currently, each instance uses a common database with a single list of urls; adding support for multiple users would require implementation of Firebase sign-in; and a function to update the baseUrl to include Firebase user id.
5. Add request construction wizard to add modal: currently, a user must input a complete url including all parameters; a wizard could accept a base url and various parameters, then construct the URL for the user. This would require an update to the add modal (index.html:lines 26-48) and the submit function (main.js:lines 25-59) (or a new function that passes the constructed url to the submit function).
6. BUG FIX NEEDED - When editing a url, if you click 'cancel' on the prompt, the url is updated to an empty string: probably would be best to replace the prompt with a custom modal that includes error handling and also allows editing of non-count fields (count fields should never be editable in the UI); requires new elements to be added to index.html, and updates to the editUrl function (main.js:lines 146-156).
