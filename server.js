'use strict'

const debug = require('debug')('gu:api:server')
const chalk = require('chalk')

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

const port = process.env.PORT || 4949
const app = express()
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
const server = http.createServer(app)

const api = require('./api')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/', api)

// Express Error Handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)
  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }
  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  server.listen(port, () => {
    console.log(`${chalk.green('[gu-api]')} server listening on port ${chalk.cyan(port)}`)
  })
}

module.exports = server
