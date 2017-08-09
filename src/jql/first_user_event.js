function main() {
  return Events({
    from_date: '2017-01-01',
    to_date: '2018-01-01'
  })
  .groupByUser((state, events) => {
    const sortedEvents = events.sort((a, b) => a.time - b.time)
    return sortedEvents[0].time
  })
}
