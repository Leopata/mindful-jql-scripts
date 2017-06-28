import request from 'request-promise';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const endpoint = 'https://mixpanel.com/api/2.0/jql';
const apiKey = process.env.MIXPANEL_API_SECRET;
const apiKeyBase64 = new Buffer(`${apiKey}:`).toString('base64');
const authHeader = { 'Authorization': `Basic ${apiKeyBase64}` };

// Call Mixpanel API with the JQL script
const executeJQL = (jql) => {
  const encodedQuery = encodeURIComponent(jql);
  const uri = `${endpoint}?script=${encodedQuery}`;
  const opts = { uri: uri, headers: authHeader, json: true };
  return request(opts);
};

// Load the JQL format file
const readQueryFile = (filename) => {
  return new Promise((resolve, reject) => {
    const path = `${__dirname}/jql/${filename}`;
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
};

// Make something useful with the JQL response
const processJsonResponse = (json) => {
  const distinctIds = json;
  console.log(`${distinctIds.length} distinct ids found !`);

  const samples = distinctIds.slice(1, 10);
  console.log(samples);
};

readQueryFile('query.js')
  .then(file => executeJQL(file))
  .then(json => processJsonResponse(json))
  .catch(error => console.error(error));
