function main() {
  return People()
    .map(user => ({
      id: user.distinct_id,
      first_visit: user.properties['first-visit']
    }))
}
