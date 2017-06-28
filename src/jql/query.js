function main() {
  return join(
    Events({
      from_date: '2017-03-25',
      to_date: '2018-06-23'
    }),
    People(),
    { type: 'full' }
  )
  .filter(function(tuple){
    return !tuple.event && tuple.user
  })
  .map(function(tuple){
    return tuple.user.distinct_id
  })
}
