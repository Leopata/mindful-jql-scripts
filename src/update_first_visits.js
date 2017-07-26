import request from 'request-promise'
import { readQueryFile, executeJQL } from './jql/execute_jql'

const filterInvalidUsers = (users) => {
  return users.filter(user => {
    const firstVisit = user.properties['first-visit']
    const timestamp = Date.parse(firstVisit)
    return isNaN(timestamp)
  })
}

const addDaysToDate = (fromDate, days) => {
  var dat = new Date(fromDate.valueOf())
  dat.setDate(dat.getDate() + days)
  return dat
}

const referenceDate = new Date('2017-01-01')
const correctDateForUser = (user) => {
  const firstVisit = user.properties['first-visit']
  const day = parseInt(firstVisit.split('-')[2].split('T')[0])
  const newDate = addDaysToDate(referenceDate, day)
  const components = firstVisit.replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1').split(':')
  newDate.setHours(
    parseInt(components[0]),
    parseInt(components[1]),
    parseInt(components[2])
  )
  return newDate
}

const updateUsersWithCorrectDate = ({ users, mixpanel }) => {
  let remainingUsers = users

  const batchSize = 50
  const sendBatch = () => {
    const chunk = remainingUsers.splice(0, batchSize)
    const data = chunk.map(user => ({
      $token: mixpanel.token,
      $distinct_id: user.distinct_id,
      $set: { 'first-visit': correctDateForUser(user) }
    }))
    const enc = new Buffer(JSON.stringify(data)).toString('base64')
    const uri = `https://api.mixpanel.com/engage?data=${enc}&verbose=1`

    return request(uri).then(res => {
      console.log(res)
      if (remainingUsers.length > 0) {
        return sendBatch()
      }
      return res
    })
  }

  return sendBatch()
}

export default function updateFirstVisits({ mixpanel } = {}) {
  readQueryFile('invalid_user_first_visits.js')
    .then(jql => executeJQL({ mixpanel, jql }))
    .then(filterInvalidUsers)
    .then(users => updateUsersWithCorrectDate({ users, mixpanel }))
}
