const path = require('path')
const Hapi = require('hapi')
const Inert = require('inert')
const Vision = require('vision')
const HapiSwagger = require('hapi-swagger')
const requireDirectory = require('require-directory')
const routes = requireDirectory(module, './routes')
const about = require('../package.json')
const swagger_info = {
  schemes: ['https'],
  info: {
    'title': 'tagged dat registry api',
    'version': about.version
  },
  pathPrefixSize: 3,
  tags: [
  ],
  payloadType: 'json',
  jsonEditor: true,
  expanded: 'list'
}

exports.server = function (config, services, cb) {
  var server = new Hapi.Server()
  server.app.config = config
  server.app.about = about
  server.app.services = services

  server.connection({ port: config.port })
  if (config.schemes) swagger_info.schemes = config.schemes
  server.register([Inert, Vision, {
    'register': HapiSwagger,
    'options': swagger_info
  }], function (err) {
    if (err) return cb(err)
    let loadRoute = r => {
      server.route(r)
      console.log('loaded route', r.path, r.method)
    }
    Object.keys(routes).forEach(key => {
      let possibleRoutes = routes[key]
      if (possibleRoutes.path) loadRoute(possibleRoutes)
      else possibleRoutes.forEach(r => loadRoute(r))
    })
    server.start(function (err) {
      cb(err)
    })
  })
}

exports.mock = function (req, reply) {
  reply({mock: true})
}
