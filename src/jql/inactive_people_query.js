function main() {
  return join(
    Events({
      from_date: '2017-08-01',
      to_date: '2018-01-01'
    }),
    People(),
    { type: 'full' }
  )
  .filter(function(tuple){
    return !tuple.event && tuple.user && !tuple.user.properties["$email"]
  })
  .map(function(tuple){
    return tuple.user.distinct_id
  })
}
