import request from 'request-promise';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


// Call Mixpanel API with the JQL script
const executeJQL = (mixpanel, jql) => {
  const mixpanelBase64Secret = new Buffer(`${mixpanel.secret}:`).toString('base64');
  const authHeader = { 'Authorization': `Basic ${mixpanelBase64Secret}` };
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
  console.log(`Found ${ids.length} users to delete.`);
  const content = ids.map(id => (`${id}\n`));
  return writeFile('output.txt', content);
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

const deleteUsers = (mixpanel, distinctIds) => {
  console.log(`Found ${distinctIds.length} users to delete.`);

  let remainingIds = distinctIds;

  const batchSize = 50;
  const sendBatch = () => {
    const chunk = remainingIds.splice(0, batchSize);

    console.log(`> Deleting ${chunk.length} users...`);

    const data = chunk.map(id => ({ $token: mixpanel.token, $distinct_id: id, $delete: true, $ignore_alias: true }));
    const enc = new Buffer(JSON.stringify(data)).toString('base64');
    const uri = `https://api.mixpanel.com/engage?data=${enc}&verbose=1`;

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

export default function removeDuplicates(dryRun, mixpanel) {
  if (!dryRun) {
    console.warn('= Delete all mode ON');

    readQueryFile('inactive_people_query.js')
      .then(file => executeJQL(mixpanel, file))
      .then(ids => deleteUsers(mixpanel, ids))
      .catch(error => console.error(error));
  } else {
    console.log('= Dry run mode ON');

    readQueryFile('inactive_people_query.js')
      .then(file => executeJQL(mixpanel, file))
      .then(ids => buildOutputFile(ids))
      .catch(error => console.error(error));
  }
}
