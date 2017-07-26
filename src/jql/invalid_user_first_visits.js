function main() {
  return People().filter(function(user) {
    return user.properties['first-visit'] !== undefined
  })
}
