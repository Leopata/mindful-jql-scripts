import { readQueryFile, executeJQL, batchEngage } from './jql/execute_jql'

export default function fixEventNames({ mixpanel } = {}) {
  console.log('Fixing profile-completion ...')
  readQueryFile('user_wrong_event_names.js')
    .then(jql => executeJQL({ mixpanel, jql }))
    .then(console.log)
    .catch(console.error)
}
