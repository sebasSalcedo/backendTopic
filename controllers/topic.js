"use strict";

const validator = require("validator");
const Topic = require("../models/topic");

var controller = {
  test: function (req, res) {
    return res.status(200).send({
      message: "Hola mundo desde topic",
    });
  },

  /**
   * Metodo que permite guardar un topic
   * @param {*} req
   * @param {*} res
   * @returns
   */
  save: function (req, res) {
    // Recoger los parametros por post

    var params = req.body;

    // Validar los datos

    try {
      var validate_title = !validator.isEmpty(req.body.title);
      var validate_content = !validator.isEmpty(params.content);
      var validate_lang = !validator.isEmpty(params.lang);
    } catch (err) {
      return res.status(400).send({
        status: "error",
        message: "Faltan datos por validar.",
      });
    }
    if (validate_title && validate_content && validate_lang) {
      // Crear el objeto a guardar

      var topic = new Topic();

      // Asignar valores

      topic.title = params.title;
      topic.content = params.content;
      topic.code = params.code;
      topic.lang = params.lang;
      topic.user = req.user.sub;

      // Guardar el Topic

      topic.save((err, topicStored) => {
        if (err || !topicStored) {
          return res.status(404).send({
            status: "error",
            message: "error al guardar el tema.",
          });
        } else {
          // Devolver una respuesta

          return res.status(200).send({
            status: "succes",
            message: topicStored,
          });
        }
      });
    } else {
      return res.status(200).send({
        message: "Los datos no son validos",
      });
    }
  },

  /**
   *
   * @param {*} req
   * @param {*} res
   */

  getTopics: function (req, res) {
    // Cargar la libreria de la paginacion en la clase

    // Recoger la página actua

    if (
      !req.params.page ||
      req.params.page == 0 ||
      req.params.page == "0" ||
      !req.params.page == null ||
      req.params.page == undefined
    ) {
      var page = 1;
    } else {
      var page = parseInt(req.params.page);
    }
    // Indicar las opciones de paginación

    var options = {
      sort: { date: -1 },
      populate: "user",
      limit: 5,
      page: page,
    };

    // Find paginado

    Topic.paginate({}, options, (err, topics) => {
      if (err) {
        return res.status(500).send({
          status: "error",
          message: "Se ha presentado un error a realizar la consulta",
          err: err,
        });
      } else if (!topics) {
        return res.status(200).send({
          status: "success",
          message: "No existe Topics.",
          err: err,
        });
      } else {
        // Devolver resultado (Topics, Total de Topics, Total de paginas)

        return res.status(200).send({
          message: "success",
          topics: topics.docs,
          totalDocs: topics.totalDocs,
          totalPages: topics.totalPages,
        });
      }
    });
  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   */

  getMyTopicsByUser: function (req, res) {
    // Conseguir id del usuario

    var userId = req.params.sub;

    // Find con la condicion de Usuario

    Topic.find({
      user: userId,
    })
      .sort([["date", "descending"]])
      .exec((err, topics) => {
        // Devolver una respuesta
        if (err) {
          return res.status(500).send({
            status: "error",
            message: "Error en la consulta de los topics",
          });
        } else if (!topics) {
          return res.status(404).send({
            status: "error",
            message: "No existe temas para mostrar",
          });
        } else {
          return res.status(200).send({
            status: "success",
            message: "Consulta exitosa",
            Topics: topics,
          });
        }
      });
  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   */

  getTopic :function (req,res) {

    // Sacar el id del topic de la url

    var topicId = req.params.id;

    // Find por id el topic

    Topic.findById(topicId).populate('user').exec( (err,topic) => {

      if (err) {
        return res.status(500).send({
          status: "error",
          message: "Se ha presentado un error en la consulta",
        });
      } else if(!topic){

        return res.status(404).send({
          status: "error",
          message: "No existe topic con ese  id registrado",
        });
        
      }else{

        return res.status(200).send({
          status: "success",
          message: "Se ha realizado con exito la consulta",
          Topic: topic
        });
      }

    });

    

   
  }

};

module.exports = controller;
