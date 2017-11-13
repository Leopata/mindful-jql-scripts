# Mindul Mixpanel JQL

## General
-----
This is a repository that contains JQL scripts to updated / delete / clean wrong datas in Mixpanel for Mindful.  

### Authentication
Mixpanel's API key, secret and token should be contained in a `.env` file, using the following keys :
```
MIXPANEL_API_KEY=some-mixpanel-api-key
MIXPANEL_API_SECRET=some-mixpanel-api-secret
MIXPANEL_API_TOKEN=some-mixpanel-api-token
```
These values can be found as described [here](https://mixpanel.com/help/questions/articles/where-can-i-find-my-project-token), using the account `prod@wopata.com`.

### Run scripts
The repository contains an `index.js` file that imports the scripts and run them.  
You'll need to uncomment the line calling the script you want to run (see below).  

## Active scripts
------
These scripts are maintained and used regularly.
### Delete inactive users
Finds anonymous people that has no events in a given date range, and deletes them.  
The date should be set in the `src/jql/inactive_people_query.js`, in the `from_date` and `to_date` keys.  
Typically, the date range should be the past three months (so `from_date` should be three months ago, and `to_date` should be today).

## Inactive scripts
------
This is a list of scripts that were made by David Miotti, were ran once, and never maintenained afterwards.  
They can be found (along with their documentation) in the Git history, at commit `0261f880`.
- Fix first-visit on users
