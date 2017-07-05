# Mixpanel JQL

Destroy all Mixpanel people inactive since 2017-01-01.

## Setup

You must have a `.env` file that reference those keys:

```
DELETE_ALL=false
MIXPANEL_API_SECRET=
MIXPANEL_TOKEN=
MIXPANEL_API_SECRET=
```

## Run

Launch the script with `npm run start`.

By default, it will log the projected user deletion count and write all distinctId in an `output.txt` file.

Check its content, and if it seems good, update the `.env` file with `DELETE_ALL=true` and play `npm run start` again.
