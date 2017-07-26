import request from 'request-promise'
import fs from 'fs'

// Call Mixpanel API with the JQL script
export const executeJQL = ({ mixpanel, jql }) => {
  const secret = new Buffer(`${mixpanel.secret}:`).toString('base64');
  const auth = { 'Authorization': `Basic ${secret}` };
  const encodedQuery = encodeURIComponent(jql)
  const uri = `https://mixpanel.com/api/2.0/jql?script=${encodedQuery}`
  return request({ uri: uri, headers: auth, json: true })
}

// Load the JQL format file
export const readQueryFile = (filename) => {
  return new Promise((resolve, reject) => {
    const path = `${__dirname}/${filename}`
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    })
  })
}
