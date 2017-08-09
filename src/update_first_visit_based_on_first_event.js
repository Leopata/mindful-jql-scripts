import { readQueryFile, executeJQL, batchEngage } from './jql/execute_jql'

const formatTuples = (tuples) => tuples.map(tuple => ({
  id: tuple.key[0], date: tuple.value
}))
// .filter(item => item.id === '7e50883e-30d5-4835-9a7b-43b62e47e918')

/// Agregate all user infos
const agregateUserInfos = (usersWithFirstVisit, usersWithFirstEventDate) => {
  return usersWithFirstEventDate.map(userWithFirstEventDate => {
    const distinctId = userWithFirstEventDate.id
    const matched = usersWithFirstVisit.filter(o => o.id === distinctId)

    const firstEventDate = new Date(userWithFirstEventDate.date)
    firstEventDate.setHours(firstEventDate.getHours() - 2)

    let firstVisit = null
    if (matched.length > 0) {
      firstVisit = new Date(matched[0].first_visit)
    }

    if (firstVisit === null || firstVisit === undefined) {
      firstVisit = firstEventDate
    }

    return {
      distinctId: distinctId,
      firstEventDate: firstEventDate,
      firstVisit: firstVisit
    }
  })
}

const normalizeAgregation = (aggr) => {
  return aggr.map(aggr => {
    const firstEventDate = aggr.firstEventDate
    const firstVisitDate = aggr.firstVisit
    if (firstEventDate.getTime() < firstVisitDate.getTime()) {
      aggr.firstVisit = aggr.firstEventDate
    } else {
      aggr.firstVisit = firstVisitDate
    }
    return aggr
  })
}

const updateUsersWithFirstVisit = ({ mixpanel }, users) => {
  console.log(`> Fixing ${users.length} users ...`)
  const payloads = users.map(user => {
    return {
      $token: mixpanel.token,
      $distinct_id: user.distinctId,
      $set: { 'first-visit': user.firstVisit }
    }
  })
  return batchEngage(payloads)
}

const getUsersFirstVisit = ({ mixpanel }, items) => {
  return readQueryFile('people_first_visit.js')
    .then(jql => executeJQL({ mixpanel, jql }))
    .then(firstVisitUsers => agregateUserInfos(firstVisitUsers, items))
}

export default function updateFirstVisitsBaseOnFirstEvent({ mixpanel } = {}) {
  return readQueryFile('first_user_event.js')
    .then(jql => executeJQL({ mixpanel, jql }))
    .then(formatTuples)
    .then(usersWithFirstEventDate => getUsersFirstVisit({ mixpanel }, usersWithFirstEventDate))
    .then(normalizeAgregation)
    .then(users => updateUsersWithFirstVisit({ mixpanel }, users))
    .then(console.log)
    .catch(console.error)
}
