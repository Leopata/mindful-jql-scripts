import deleteInactivePeople from './scripts/delete_inactive_people'
import dotenv from 'dotenv'
dotenv.config()

const mixpanel = {
  key: process.env.MIXPANEL_API_KEY,
  secret: process.env.MIXPANEL_API_SECRET,
  token: process.env.MIXPANEL_API_TOKEN
}

const dryRun = true

deleteInactivePeople(dryRun, mixpanel)
