// api/index.js
const serverless = require('serverless-http');
const app = require('server.js'); // Adjust the path as necessary

module.exports = serverless(app);
