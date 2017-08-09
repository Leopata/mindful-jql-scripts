import { readQueryFile, executeJQL, batchEngage } from './jql/execute_jql'

const filterInvalidUsers = (users) => {
  return users.filter(user => {
    const firstVisit = user.properties['first-visit']
    const timestamp = Date.parse(firstVisit)
    return isNaN(timestamp)
  })
}

const addDaysToDate = (fromDate, days) => {
  let dat = new Date(fromDate.valueOf())
  dat.setDate(dat.getDate() + days)
  return dat
}

const referenceDate = new Date('2017-01-01')
const correctDateForUser = (user) => {
  const firstVisit = user.properties['first-visit']
  const day = parseInt(firstVisit.split('-')[2].split('T')[0])
  const newDate = addDaysToDate(referenceDate, day)
  const components = firstVisit.replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1').split(':')
  newDate.setHours(parseInt(components[0]), parseInt(components[1]), parseInt(components[2]))
  return newDate
}

const updateUsersWithCorrectDate = ({ users, mixpanel }) => {
  console.log(`> Fixing ${users.length} users ...`)
  const payloads = users.map(user => ({
    $token: mixpanel.token,
    $distinct_id: user.distinct_id,
    $set: { 'first-visit': correctDateForUser(user) }
  }))
  return batchEngage(payloads)
}

export default function updateFirstVisits({ mixpanel } = {}) {
  return readQueryFile('invalid_user_first_visits.js')
    .then(jql => executeJQL({ mixpanel, jql }))
    .then(filterInvalidUsers)
    .then(users => updateUsersWithCorrectDate({ users, mixpanel }))
}
