function main() {
  return Events({
    from_date: '2017-01-01',
    to_date: '2018-01-01'
  })
  .groupByUser((state, events) => {
    const eventTime = events[0].time
    if (state !== undefined && state < eventTime) {
      return state
    }
    return eventTime
  })
}
