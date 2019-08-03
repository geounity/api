const trae = require('trae')
const configService = require('./config')

const apiRestCountries = trae.create({
  baseUrl: configService.apiRestCountriesUrl
})

module.exports = apiRestCountries
