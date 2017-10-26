const fetchDatMeta = require('./fetchDatMeta')

module.exports = function (hash, config, services, done) {
  if (!done) done = () => {}
  fetchDatMeta(hash, (err, about) => {
    services.ar.add(new Buffer(hash, 'hex'), function (err) {
      if (err) return done(err)
      let meta = {}
      if (err) meta.error = err.toString()
      else {
        meta.title = about.title,
        meta.tags = about.tags,
        meta.description = about.description
        meta.id = hash
      }
      services.searchIndex.concurrentAdd({}, [meta], err => {
        if (err) console.log(err)
        done()
      })
    })
  })
}
