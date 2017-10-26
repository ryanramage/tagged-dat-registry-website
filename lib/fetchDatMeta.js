var Dat = require('dat-node')
var ram = require('random-access-memory')

module.exports = function (hash, _done) {
  let complete = false
  let _dat = null
  let done = (err, resp) => {
    if (!complete) _done(err, resp)
    complete = true
    if (_dat) _dat.close(() => {})
  }
  setTimeout(() => done('dat time out'), 2000)

  Dat(ram, {key: hash, sparse: true}, function (err, dat) {
    if (err) return done(err)
    _dat = dat
    var network = dat.joinNetwork()
    dat.archive.readFile('/dat.json', function (err, content) {
      if (err) return done(err)
      try {
        var about = JSON.parse(content.toString())
        done(null, about)
      } catch (e) { done(e) }
    })

  })
}
