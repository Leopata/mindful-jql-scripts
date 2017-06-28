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

    const data = chunk.map(id => ({ $token: mixpanelApiToken, $distinct_id: id, $delete: '' }));
    const enc = new Buffer(JSON.stringify(data)).toString('base64');
    const uri = getURL('engage', { verbose: 1, ignore_time: true, ip: 0 });
    return request({ uri: uri, method: 'POST', form: { data: enc }, json: true }).then(res => {
      if (remainingIds.length > 0) {
        return sendBatch();
      }
      return res;
    });
  };

  return sendBatch();
};

const getURL = (endpoint, opts) => {
  const expirationTime = 10; // expressed in mins
  opts.api_key = mixpanelApiKey;
  opts.expire = Math.round(Date.now() / 1000) + 60 * expirationTime;

  const sortedKeys = Object.keys(opts).sort();
  const params = [];
  let concatKeys = "";

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    params.push(`${key}=${opts[key]}`);
    concatKeys += params[params.length - 1];
  }

  let sig = crypto
    .createHash('md5')
    .update(concatKeys + mixpanelApiSecret)
    .digest('hex');

  return `https://api.mixpanel.com/${endpoint}/?${params.join('&')}&sig=${sig}`;
};

readQueryFile('query.js')
  .then(file => executeJQL(file))
  .then(ids => buildOutputFile(ids))
  // .then(ids => deleteUsers(ids))
  .then(json => console.log(`Finished with ${JSON.stringify(json)}`))
  .catch(error => console.error(error));
