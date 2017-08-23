import { readQueryFile, executeJQL, batchEngage } from './jql/execute_jql'

const formatTuples = (tuples) => tuples.map(tuple => ({
  id: tuple.key[0], date: tuple.value
}))
// .filter(item => item.id === '546D2BB2-8D58-4319-8AE6-6FC46790692A')

/// Agregate all user infos
const agregateUserInfos = (usersWithFirstVisit, usersWithFirstEventDate) => {
  return usersWithFirstEventDate.map(userWithFirstEventDate => {
    const distinctId = userWithFirstEventDate.id
    const matched = usersWithFirstVisit.filter(o => o.id === distinctId)
    const firstEventDate = new Date(userWithFirstEventDate.date)

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

    console.log(`\nDistinct Id: ${aggr.distinctId}`)
    console.log(`==> First Event Date: ${firstEventDate}`)
    console.log(`==> First Visit Date: ${firstVisitDate}`)

    if (firstEventDate.getTime() < firstVisitDate.getTime()) {
      aggr.firstVisit = aggr.firstEventDate
    } else {
      aggr.firstVisit = firstVisitDate
    }

    console.log(`==> Resolved First Visit Date: ${aggr.firstVisit}`)

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
    // .then(data => {
    //   data.forEach(data => {
    //     const distinctId = data.id
    //     const date = (new Date(data.date)).toISOString()
    //     console.log(`${distinctId}: ${date}`)
    //   })
    //   return data
    // })
    .then(usersWithFirstEventDate => getUsersFirstVisit({ mixpanel }, usersWithFirstEventDate))
    .then(normalizeAgregation)
    .then(users => updateUsersWithFirstVisit({ mixpanel }, users))
    .then(console.log)
    .catch(console.error)
}
