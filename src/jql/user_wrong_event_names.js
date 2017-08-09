function main() {
  return Events({
    from_date: '2017-01-01',
    to_date: '2018-01-01',
    event_selectors: [{
      event: 'profile-completion',
      selector: 'properties["type"] == "birthYear" or properties["type"] == "zip" or properties["type"] == "sector"'
    }]
  })
}
