const _ = require('lodash')
const Joi = require('joi')
const Boom = require('boom')
const reindex = require('../reindex')

module.exports = [{
  method: 'PUT',
  path: '/api/{hash}',
  config: {
    description: 'Register a new dat by its hash',
    tags: ['api'],
    validate: {
      params: {
        hash: Joi.string().required().description('the dat hash')
      }
    }
  },
  handler: (req, reply) => {
    reply({ok: true, processing: true})
    process.nextTick(() => reindex(req.params.hash, req.server.app.config, req.server.app.services))
  }
}, {
  method: 'GET',
  path: '/api/{hash}',
  config: {
    description: 'Get info we have about a hash',
    tags: ['api'],
    validate: {
      params: {
        hash: Joi.string().required().description('the dat hash')
      }
    }
  },
  handler: (req, reply) => {
    let results = []
    req.server.app.services.searchIndex.get([req.params.hash])
      .on('data', d => results.push(d))
      .on('end', () => {
        if (results.length) return reply(results[0])
        else return reply(Boom.notFound())
      })
      .on('error', e => reply(Boom.wrap(e)))
  }
},{
  method: 'GET',
  path: '/api/search/byTags/{tags}',
  config: {
    description: 'Get info we have about a hash',
    tags: ['api'],
    validate: {
      params: {
        tags: Joi.string().required().description('comma seperated tags that must be set on the document to match')
      }
    }
  },
  handler: (req, reply) => {
    let results = []
    let tags = req.params.tags.split(',')
    let and = { tags: tags }
    //if (req.query.text) and['*'] = req.query.text
    let q = {
      query: [{
        AND: and
      }]
    }
    req.server.app.services.searchIndex.search(q)
      .on('data', d => {
        results.push(d.document)
      })
      .on('end', () => {
        reply(results)
      })
      .on('error', e => reply(Boom.wrap(e)))
  }
}]
