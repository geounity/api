'use strict'

const test = require('ava')
const request = require('supertest')
const config = require('../config')

const auth = require('../auth')
const util = require('util')
const sign = util.promisify(auth.sign)

const server = require('../server')

let token

test.beforeEach(async () => {
  token = await sign({ admin: true, username: 'sebas' }, config.auth.secret)
})

test.serial.cb('/statics', t => {
  console.log(token)
  request(server)
    .get('/Americas/countries')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      t.end()
    })
})

// test('GET /users', async t => {
//   let id = 2
//   let server = micro(async (req, res) => {
//     send(res, 200, { id })
//   })
//   let url = await listen(server)
//   console.log('-----------------' + url)
//   let body = await request({ uri: url, json: true })
//   t.deepEqual(body, { id })
// })
// test.todo('POST /debate')

// const server = require('../server')

// test.serial.cb('/statics', t => {
//   request(server)
//     .get('/api/statics')
//     .expect(200)
//     .expect('Content-Type', /json/)
//     .end((err, res) => {
//       t.falsy(err, 'should not return an error')
//       let body = res.body
//       t.deepEqual(body.statics, 'statics', 'response body should be the expected')
//       t.end()
//     })
// })

// test.serial.cb('POST /signup', t => {
//   request(server)
//     .post('/signup')
//     .send({
//       username: 'usuarioapi',
//       password: 'foo',
//       email: 'foo@debateglobal.test'
//     })
//     .set('Accept', 'application/json')
//     .expect(201)
//     .end((err, res) => {
//       t.falsy(err, 'should not return an error')
//     })

// })
