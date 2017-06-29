import request from 'request-promise';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const mixpanelApiKey = process.env.MIXPANEL_API_KEY;
const mixpanelApiSecret = process.env.MIXPANEL_API_SECRET;
const mixpanelApiToken = process.env.MIXPANEL_API_TOKEN;

const mixpanelBase64Secret = new Buffer(`${mixpanelApiSecret}:`).toString('base64');
const authHeader = { 'Authorization': `Basic ${mixpanelBase64Secret}` };

// Call Mixpanel API with the JQL script
const executeJQL = (jql) => {
  const encodedQuery = encodeURIComponent(jql);
  const uri = `https://mixpanel.com/api/2.0/jql?script=${encodedQuery}`;
  return request({ uri: uri, headers: authHeader, json: true });
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

const buildOutputFile = (ids) => {
  const content = ids.map(id => ({ $distinct_id: id, $token: mixpanelApiToken, $delete: '' }));
  return writeFile('output.json', JSON.stringify(content));
};

const writeFile = (file, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(file);
      }
    })
  });
};

const deleteUsers = (distinctIds) => {
  let remainingIds = distinctIds;

  const batchSize = 50;
  const sendBatch = () => {
    const chunk = remainingIds.splice(0, batchSize);

    console.log(`Deleting ${chunk.length} users...`);

    const data = chunk.map(id => ({ $token: mixpanelApiToken, $distinct_id: id, $delete: true, $ignore_alias: true }));
    const enc = new Buffer(JSON.stringify(data)).toString('base64');
    const uri = `https://api.mixpanel.com/engage?data=${enc}&verbose=1`;
    console.log(uri);
    return request(uri).then(res => {
      console.log(res);
      if (remainingIds.length > 0) {
        return sendBatch();
      }
      return res;
    });
  };

  return sendBatch();
};

readQueryFile('query.js')
  .then(file => executeJQL(file))
  // .then(ids => buildOutputFile(ids))
  .then(ids => deleteUsers(ids))
  .then(json => console.log(`Finished with ${JSON.stringify(json)}`))
  .catch(error => console.error(error));
