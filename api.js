'use strict'

const debug = require('debug')('gu:api:routes')
const express = require('express')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()
const db = require('db')
const config = require('../db/config')
const configApi = require('./config')

const api = express.Router()

const apiRestCountries = require('./services_external/api_countriesrest')

let services, Geocommunity, Country, State, User

const southamerica = [{ name: 'Argentina' }, { name: 'Bolivia' }, { name: 'Brasil' }, { name: 'Colombia' }, { name: 'Chile' }, { name: 'Ecuador' }, { name: 'Guyana' }, { name: 'Guyana' }, { name: 'francesa' }, { name: 'Paraguay' }, { name: 'Peru' }, { name: 'Surinam' }, { name: 'Venezuela' }, { name: 'Uruguay' }]
const northamerica = [{ name: 'Anguila' }, { name: 'Antigua y Barbuda' }, { name: 'Aruba' }, { name: 'Bahamas' }, { name: 'Barbados' }, { name: 'Belize' }, { name: 'Bermuda' }, { name: 'Bonaire Sint Eustatius and Saba' }, { name: 'Estados Unidos' }, { name: 'Canada' }, { name: 'Islas caiman' }, { name: 'Costa rica' }, { name: 'Cuba' }, { name: 'Dominicana' }, { name: 'El  Salvador' }, { name: 'Honduras' }, { name: 'Jamaica' }, { name: 'Martinique' }, { name: 'Panama' }, { name: 'Puerto Rico' }, { name: 'Trinidad y tobago' }]
// const continents = ['Asia', 'Africa', 'Europe', 'Norte America', 'Sur America', 'Oceania', 'Polos']
  
// Conección con la base de datos
api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database')
    try {
      services = await db(config.dev)
    } catch (e) {
      return next(e)
    }
    Geocommunity = services.Geocommunity
    Country = services.Country
    State = services.State

  }
  next()
})

// ------------
// GET
// ------------

// Communities

// All continents
api.get('/continents', async (req, res, next) => {
  debug('List of continents')
  let continents = await Geocommunity.getContinents()
  res.send(continents)
})
api.get('/:continent')
// Countries in Continent
api.get('/:continent/countries', async (req, res, next) => {
  // Nosotros nos basamos en el modelo de 6 continentes [Africa, America, Asia, Europa, Oceania y Antartida]
  let { continent } = req.params
  debug(`All countries for a ${continent}`)
  let countries = []
  if (continent === 'Sur America') {
    countries = await Country.getBySubregion('South America')
  }
  else if (continent === 'Norte America') {
    countries = await Country.getBySubregion('Northern America')
  }
  else{
    try {
      countries = await Country.getByContinent(continent)
    } catch (e) {
      next(e)
    }
  }
  debug(`All countries are: ${countries}`)
  res.send(countries)
})
api.get('/country/:code', async (req, res, next) => {
  let { code } = req.params
  debug(`All info of country with code ${code}`)
  let country = {}
  try{
    country = await Country.getByCode(code)
  } catch (e) {
    next(e)
  }
  res.send(country) 
})
api.get('/:countryCode/states', async (req, res, next) => {
  let { countryCode } = req.params
  debug(`All info of states in country ${countryCode}`)
  let country = {}
  try {
    country = await Country.getByCode(countryCode)
  } catch (e) {
    next(e)
  }
  console.log('COUNTRY-----')
  console.log(country)
  let states = {}
  try {
    states = await State.getAllByCountry(country.id)
  } catch (e) {
    next(e)
  }
  res.send(states)
})

api.get('/community/:name')
api.get('/countries', (req, res) => {
  res.send('Paises')
})

api.get('/:country/:state/:city')
api.get('/population', async (req, res, next) => {
  try {
    let countries = await apiRestCountries.get('/all')
    let populationTotal = countries.data.reduce((acum, { population }) => acum + population, 0)
    console.log('RESULTADO')
    res.send({
      'total': populationTotal
    })
  } catch (e) {
    console.log('Error: ', e)
  }
})

api.get('/test', (req, res, next) => {
  debug('Test')
  res.send('Estas conectado a la API!!')
})
// Users
api.get('/users', auth(configApi.auth), async (req, res, next) => { // Solo para admins
  debug('A request has come to /users')

  const { user } = req

  if (!user || !user.username) {
    return next(new Error('Not authorize'))
  }

  let users = []
  try {
    if (user.admin) {
      users = await User.findConnected()
    } else {
      users = await User.findByUsername(user.username)
    }
  } catch (e) {
    next(e)
  }
  res.send(users)
})




// Statics
api.get('/statics', auth(configApi.auth), guard.check(['metrics:read']), (req, res, next) => {
  debug('A request has come to /statics')
  const { user } = req

  if (!user || !user.username) {
    return next(new Error('Not authorized'))
  }
  let statics = []
  try {
    if (user.admin) {
      statics = 'Todas las estadisticas'
    } else {
      statics = 'Solo devuelve unas pocas'
    }
  } catch (e) {
    return next(e)
  }
  res.send(statics)
})
api.get('/static/:title', (req, res) => {
  const { title } = req.params
  res.send({ title })
})
api.get('/static/community/:name', (req, res) => {
  const { title } = req.params
  res.send({ title })
})

// Debates
api.get('/debates', (req, res) => {
  debug('A request has come to /debates')
  res.send({})
})
api.get('/debate/:title', (req, res) => {
  const { title } = req.params
  res.send({ title })
})
api.get('/debate/community/:name', (req, res) => {
  const { title } = req.params
  res.send({ title })
})

// Proposals
api.get('/proposals', (req, res) => {
  debug('A request has come to /statics')
  res.send({})
})
api.get('/proposal/:title', (req, res) => {
  const { title } = req.params
  res.send({ title })
})
api.get('/proposal/community/:name', (req, res) => {
  const { title } = req.params
  res.send({ title })
})


// Points of view
api.get('/points-of-view/:name')


api.get('/user/:username', async (req, res, next) => {
  debug('A request has come to /username')
  const { username } = req.params
  let user = {}
  try {
    user = await User.findByUsername(username)
  } catch (e) {
    next(e)
  }
  res.send(user)
})


// ------------
// POST
// ------------
api.post('/signup', async (req, res, next) => {
  debug('Post signup')
  const { body } = req
  let user = {
    username: body.username,
    email: body.email,
    password: body.password
  }
  let result = {}
  try {
    result = await User.saveUser(user)
    res.send(result)
  } catch (e) {
    console.log(e.message)
    res.status(400).send({ error: e.message })
  }

})
api.post('/debate', async (req, res, params) => {
  try {
    let token = await utils.extractToken(req)
    let encoded = await utils.verifyToken(tokem, configApi.secret)
    if (encoded && encoded.userId !== Image.userId) {
      return send(res, 401, { error: 'invalid token'})
    }
  } catch (e) {
    return send(res, 401, { error: 'invalid token'})
  }
})

module.exports = api
