"use strict";

// requires

const express = require("express");
const bodyParser = require("body-parser");

// ejecutar express

var app = express();

// cargar archivos de rutas

const user_routes = require('./routes/user');
const topic_routes = require('./routes/topic');


// Middlewares

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// CORS

// Reescribir rutas

app.use('/api',user_routes);
app.use('/api',topic_routes);

// Rutas de prueba
app.get("/prueba", (req, res) => {
  return res.status(200).send("<h1>hola mundo soy node</h1>");


});

app.post("/prueba", (req, res) => {
  return res.status(200).send({
    nombre: "Sebastian Salcedo",
    message: "Hola mundo soy un metodo post",
  });
});

// Exportar el modulo

module.exports = app;
