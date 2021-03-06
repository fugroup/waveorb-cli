const _ = require('lodash')
const sirloin = require('sirloin')
const markup = require('./markup.js')
const orb = require('./orb.js')
const tools  = require('extras')
const loader = require('./loader.js')
const actions = require('./actions.js')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

// Set up port. WAVEORB_PORT takes precedence.
let port = 5000
if (process.env.WAVEORB_PORT) {
  port = parseInt(process.env.WAVEORB_PORT)
} else if (process.env.NODE_ENV == 'production') {
  if (tools.exist('waveorb.json')) {
    const config = tools.read('waveorb.json')
    if (config.proxy) {
      port = parseInt(config.proxy.split(':').reverse()[0])
    }
  }
}

const SERVER_OPTIONS = {
  port,
  host: process.env.WAVEORB_HOST,
  dir: process.env.WAVEORB_ASSETS || 'app/assets'
}

module.exports = async function(options = {}, app) {
  if (!app) app = await loader()
  // Uncomment to inspect app
  // tools.inspect(app)
  console.log(`Mode: ${process.env.NODE_ENV}`)
  options = _.merge(SERVER_OPTIONS, options)

  const cert = process.env.WAVEORB_SSL_CERT
  const key = process.env.WAVEORB_SSL_KEY
  if (cert && key) {
    console.log(`Using cert ${cert}`)
    console.log(`Using key ${key}`)
    options.ssl = { key, cert }
  }

  const server = sirloin(options)

  // Apply middleware
  for (const m in app.middleware) {
    const fn = app.middleware[m]
    typeof fn === 'function' && server.use(fn)
  }

  function dispatch(fn, client, params) {
    if (params) tools.transform(params)
    const $ = orb(app, client, params)
    try {
      return fn($)
    } catch (e) {
      console.error('ERROR!')
      e = { error: { message: e.message, name: e.name, stack: e.stack } }
      console.log(e)
      return e
    }
  }

  // Markup requests
  server.get('*', function(req, res) {
    if (!(/\.html$/).test(req.pathname) && !req.pathname.endsWith('/')) return
    const client = { query: req.query, req, res, server }
    return dispatch(markup, client)
  })

  // Websocket requests
  server.action('*', function(params, socket) {
    const client = { socket, server }
    return dispatch(actions, client, params)
  })

  // HTTP requests
  server.post('*', function(req, res) {
    const { params, files, query } = req
    const client = { files, query, req, res, server }
    return dispatch(actions, client, params)
  })

  return { server, options, app }
}
