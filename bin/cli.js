#!/usr/bin/env node
var mkdirp = require('mkdirp')
var archiver = require('hypercore-archiver')
var swarm = require('hypercore-archiver/swarm')
const config = require('rc')('taggedregistry', require('../options'))
mkdirp.sync(config.archiveDir)
const services = {}
services.ar = archiver(config.archiveDir)
var server = swarm(services.ar)

require('search-index')(config, function(err, searchIndex) {
  if (err) return error(err)
  services.searchIndex = searchIndex
  require('../lib').server(config, services, err => {
    if (err) console.log('error starting server', err)
    console.log('started on port', config.port)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT. Exiting')
  process.exit()
})

function error (err) {
  console.log("could not start", err)
  process.exit(1)
}
