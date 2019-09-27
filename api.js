"use strict";

const debug = require("debug")("gu:api:routes");
const express = require("express");
const auth = require("express-jwt");
const guard = require("express-jwt-permissions")();

// Instancia de base de datos con Sequelize
const db = require("./db");
const config = require("./db/config");
const configApi = require("./config");

const api = express.Router();

const apiRestCountries = require("./services/external/api_countriesrest");

let services, Geocommunity, Country, State, User;

// Conección con la base de datos
api.use("*", async (req, res, next) => {
  if (!services) {
    debug("Connecting to database");
    try {
      services = await db(config.dev);
    } catch (e) {
      return next(e);
    }
    Geocommunity = services.Geocommunity;
    Country = services.Country;
    State = services.State;
    User = services.User;
  }
  next();
});

api.get("/test", (req, res, next) => {
  debug("Test");
  res.send("Estas conectado a la API!!");
});

// ------------
// GET
// ------------

// Communities

// All continents
api.get("/continents", async (req, res, next) => {
  debug("List of continents");
  let continents = await Geocommunity.getContinents();
  res.send(continents);
});

api.get("/:continent/countries", async (req, res, next) => {
  let { continent } = req.params;
  debug(`All countries for a ${continent}`);
  let countries = [];
  countries = await Country.getAllByContinent(continent);
  debug(`All countries are: ${countries}`);
  res.send(countries);
});

api.get("/:country/states", async (req, res, next) => {
  let { country } = req.params;
  debug(`All states in country ${country}`);
  let id = await Country.getIdByName(country);
  let states = {};
  try {
    states = await State.getAllByCountry(id);
  } catch (e) {
    next(e);
  }
  res.send(states);
});

api.get("/country/:code", async (req, res, next) => {
  let { code } = req.params;
  debug(`All info of country with code ${code}`);
  code = code.toUpperCase();
  let country = {};
  try {
    country = await Country.getByCode(code);
  } catch (e) {
    next(e);
  }
  res.send(country);
});

api.get("/countries", (req, res, next) => {
  apiRestCountries
    .get("/")
    .then(countries => {
      let { data } = countries;
      res.send(data);
    })
    .catch(e => {
      next(e);
    });
});

api.get("/:country/:state/:cities", (req, res, next) => {
  res.send("Building...");
});

api.get("/population", async (req, res, next) => {
  try {
    let countries = await apiRestCountries.get("/all");
    let populationTotal = countries.data.reduce(
      (acum, { population }) => acum + population,
      0
    );
    console.log("RESULTADO");
    res.send({
      total: populationTotal
    });
  } catch (e) {
    console.log("Error: ", e);
  }
});

// Users
api.get("/users", auth(configApi.auth), async (req, res, next) => {
  // Solo para admins
  debug("A request has come to /users");

  const { user } = req;

  if (!user || !user.username) {
    return next(new Error("Not authorize"));
  }

  let users = [];
  try {
    if (user.admin) {
      users = await User.findConnected();
    } else {
      users = await User.findByUsername(user.username);
    }
  } catch (e) {
    next(e);
  }
  res.send(users);
});

// Statics
api.get(
  "/statics",
  auth(configApi.auth),
  guard.check(["metrics:read"]),
  (req, res, next) => {
    debug("A request has come to /statics");
    const { user } = req;

    if (!user || !user.username) {
      return next(new Error("Not authorized"));
    }
    let statics = [];
    try {
      if (user.admin) {
        statics = "Todas las estadisticas";
      } else {
        statics = "Solo devuelve unas pocas";
      }
    } catch (e) {
      return next(e);
    }
    res.send(statics);
  }
);
api.get("/static/:title", (req, res) => {
  const { title } = req.params;
  res.send({ title });
});
api.get("/static/community/:name", (req, res) => {
  const { title } = req.params;
  res.send({ title });
});

// Debates
api.get("/debates", (req, res) => {
  debug("A request has come to /debates");
  res.send({});
});
api.get("/debate/:title", (req, res) => {
  const { title } = req.params;
  res.send({ title });
});
api.get("/debate/community/:name", (req, res) => {
  const { title } = req.params;
  res.send({ title });
});

// Proposals
api.get("/proposals", (req, res) => {
  debug("A request has come to /statics");
  res.send({});
});
api.get("/proposal/:title", (req, res) => {
  const { title } = req.params;
  res.send({ title });
});
api.get("/proposal/community/:name", (req, res) => {
  const { title } = req.params;
  res.send({ title });
});

// Points of view
api.get("/points-of-view/:name");

api.get("/user/:username", async (req, res, next) => {
  debug("A request has come to /username");
  const { username } = req.params;
  let user = {};
  try {
    user = await User.findByUsername(username);
  } catch (e) {
    next(e);
  }
  res.send(user ? true : false);
});
api.get("/user/email/:email", async (req, res, next) => {
  debug("A request has come to /username");
  const { email } = req.params;
  let user = {};
  try {
    user = await User.findByEmail(email);
  } catch (e) {
    next(e);
  }
  res.send(user);
});

// ------------
// POST
// ------------
api.post("/", function(req, res) {
  res.status(201).json({
    data: {
      southamerica,
      northamerica
    },
    message: "countries listed"
  });
});
api.post("/signup", async (req, res, next) => {
  debug("Post signup");
  const { body } = req;
  let user = {
    username: body.username,
    email: body.email,
    password: body.password,
    id_doc_firestore: body.idDoc
  };
  let result = {};
  try {
    result = await User.saveUser(user);
    res.send(result);
  } catch (e) {
    console.log(e.message);
    res.status(400).send({ error: e.message });
  }
});
api.post("/debate", async (req, res, params) => {
  try {
    let token = await utils.extractToken(req);
    let encoded = await utils.verifyToken(tokem, configApi.secret);
    if (encoded && encoded.userId !== Image.userId) {
      return send(res, 401, { error: "invalid token" });
    }
  } catch (e) {
    return send(res, 401, { error: "invalid token" });
  }
});

// ------------
// PUT
// ------------
// En el navegador me sale este error con put:
// Method PUT is not allowed by Access - Control - Allow - Methods in preflight response.
// Por eso uso post provisoriamente hasta que descubra por qué.
api.post("/:username/aditional-info", async (req, res, next) => {
  debug("Complete info user");
  const { body } = req;
  const { params } = req;
  const username = params.username;
  let result = {};
  let info = {
    name: body.name,
    lastname: body.lastname,
    datebirth: body.datebirth,
    service: body.service,
    photo: body.fileName
  };
  console.log("info");
  console.log(info);
  try {
    result = await User.addAditionalInfo(username, info);
    res.send(result);
  } catch (e) {
    console.log("e.message");
    console.log(e.message);
    res.status(400).send({ error: e.message });
  }
});
api.post("/:username/addphoto", async (req, res, next) => {
  const { body } = req;
  const { params } = req;
  const username = params.username;
  debug("Add photo user");
  debug(`Username: ${username}`);
  console.log(body);
  let result = {};
  try {
    result = await User.addPhotoURL(username, body.filename);
    res.send(result);
  } catch (e) {
    console.log("e.message");
    console.log(e.message);
    res.status(400).send({ error: e.message });
  }
});

module.exports = api;
