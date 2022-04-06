"use strict";

const jwt = require("jwt-simple");
const moment = require("moment");
const keySecret = "V@sT!@ñ.1590_S@lc3D0";

exports.authenticated = function (req, res, next) {
  // Comprobar si llega autoización
   
  if (!req.headers.authorization) {
    return res.status(403).send({
      message: "La petición no tiene la cabecera de la authorization",
    });
  }

  // limpiar el token y quitar comillas

  var token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    // Decodificar token
    
    var payload = jwt.decode(token, keySecret);
     
    // comprobar si el token ha expirado

    if (payload.exp <= moment().unix()) {
      return res.status(404).send({
        message: "El token ha expirado",
        err: error,
      });
    }
  } catch (error) {
     
    return res.status(404).send({
      message: "El token no es válido",
      err: error,
    });
  }

  // Adjuntar usuario identificado a request

  req.user = payload;
   
  // Pasar a la acción

  next();
};
