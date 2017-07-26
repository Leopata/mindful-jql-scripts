import dotenv from 'dotenv';
dotenv.config();

import removeDuplicates from './delete_duplicates'
import updateFirstVisits from './update_first_visits'

const mixpanel = {
  key: process.env.MIXPANEL_API_KEY,
  secret: process.env.MIXPANEL_API_SECRET,
  token: process.env.MIXPANEL_API_TOKEN
}

updateFirstVisits({ mixpanel })

// removeDuplicates(false)
