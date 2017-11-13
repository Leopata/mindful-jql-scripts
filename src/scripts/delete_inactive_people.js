import request from 'request-promise';
import { executeJQL, readQueryFile } from '../helpers/jql_helper'
import fs from 'fs'

const logUsersToDelete = (ids) => {
  console.log(`Found ${ids.length} users to delete:\n==================${ids.map(id => (`\n${id}`))}`);
  return ids;
};

const deleteUsers = (dryRun, mixpanel, distinctIds) => {
  if (dryRun) {
    return ;
  }

  let remainingIds = distinctIds;
  const batchSize = 50;
  console.log(`==================`);
  console.log(`Deleting ${distinctIds.length} users, using batches of ${batchSize}`);

  const sendBatch = () => {
    const chunk = remainingIds.splice(0, batchSize);
    console.log(`Deleting ${chunk.length} users...`);

    const data = chunk.map(id => ({ $token: mixpanel.token, $distinct_id: id, $delete: true, $ignore_alias: true }));
    const enc = new Buffer(JSON.stringify(data)).toString('base64');
    const uri = `https://api.mixpanel.com/engage?data=${enc}&verbose=1`;

    return request(uri).then(res => {
      console.log(`\tResult: ${res}`);
      if (remainingIds.length > 0) {
        return sendBatch();
      }
      return res;
    });
  };

  return sendBatch();
};

export default function deleteInactivePeople(dryRun, mixpanel) {
    readQueryFile('inactive_people_query.js')
      .then(file => executeJQL(mixpanel, file))
      .then(ids => logUsersToDelete(ids))
      .then(ids => deleteUsers(dryRun, mixpanel, ids))
      .catch(error => console.error(error));
}
