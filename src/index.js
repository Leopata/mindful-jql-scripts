import dotenv from 'dotenv'
import removeDuplicates from './delete_duplicates'
import updateFirstVisits from './update_first_visits'
import fixEventNames from './fix_event_naming'
import updateFirstVisitsBaseOnFirstEvent from './update_first_visit_based_on_first_event'

dotenv.config()

const mixpanel = {
  key: process.env.MIXPANEL_API_KEY,
  secret: process.env.MIXPANEL_API_SECRET,
  token: process.env.MIXPANEL_API_TOKEN
}

// Uncomment the line below to delete inactive and duplicates users
// removeDuplicates()

// Uncomment the line below to fix first-visit on users
// updateFirstVisitsBaseOnFirstEvent({ mixpanel })
