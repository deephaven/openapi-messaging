# OpenAPI Messaging

Uses OpenAPI to monitor PQs for failures and send emails on failure

## Setup Instructions
1. Install NodeJS v12+, then run the following 2 commands
2. `npm install`
3. Set the server name and credentials near the top of app.js
4. Set the nodemailer transporter settings and update email formatting if desired
4. `npm start`

## File Descriptions
- app.js - Main file which starts the monitor
- openapiIncludeAsync.js - Function to asynchronously include the latest version of irisapi.nocache.js from web server
- openapiPolyfill.js - Adds some missing Event classes for irisapi with Node
- irisapi.nocache.js (not tracked) - Downloaded by irisapiIncludeAsync and contains the class definitions for using the API
