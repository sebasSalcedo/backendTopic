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
   * @param {*} req request 
   * @param {*} res respuesta
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

  getTopic: function (req, res) {
    // Sacar el id del topic de la url

    var topicId = req.params.id;

    // Find por id el topic

    Topic.findById(topicId)
      .populate("user")
      .exec((err, topic) => {
        if (err) {
          return res.status(500).send({
            status: "error",
            message: "Se ha presentado un error en la consulta",
          });
        } else if (!topic) {
          return res.status(404).send({
            status: "error",
            message: "No existe topic con ese  id registrado",
          });
        } else {
          return res.status(200).send({
            status: "success",
            message: "Se ha realizado con exito la consulta",
            Topic: topic,
          });
        }
      });
  },

  update: function (req, res) {
    // Recoger el id del topic de la url

    var topicId = req.params.id;

    // Recoger los datos que llegan desde post

    var params = req.body;

    // validar datos

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
      // Montar un json con los datos modificables

      var update = {
        title: params.title,
        content: params.content,
        code: params.code,
        lang: params.lang,
      };

      Topic.findOneAndUpdate(
        { _id: topicId, user: req.user.sub },
        update,
        { new: true },
        (err, updateTopic) => {
          if (err) {
            return res.status(500).send({
              status: "error",
              message: "Se ha presentado un error en la aplicacion",
              err,
              err,
            });
          } else if (!updateTopic) {
            return res.status(500).send({
              status: "error",
              message: "No se ha realizado la actualización",
            });
          } else {
            return res.status(500).send({
              status: "success",
              message: "Se ha actualizado el Topic",
              topic: updateTopic,
            });
          }
        }
      );

      // Find and update  del topic por id y por id de usuario
    } else {
      return res.status(400).send({
        status: "error",
        message: "validación de datos es incorrecta.",
      });
    }
  },

  deleteTopic: function (req, res) {
    // Sacar el id del topic de la Url

    var topicId = req.params.id;
    var userId =  req.user.sub 

    // Find and delete por topicId y por userId

    Topic.findOneAndDelete(
      { _id: topicId, user: userId},
      (err, deleteTopic) => {

       console.log(err ,deleteTopic)
        if (err) {
          return res.status(404).send({
            status: "error",
            message: "Se ha presentando un error en el aplicativo",
            err: err,
          });
        } else if (!deleteTopic) {
          return res.status(404).send({
            status: "error",
            message: "No se a logrado eliminar el dato",
            err: err,
          });
        } else {
          return res.status(200).send({
            status: "success",
            message: "Se ha eliminado correctamente el dato",
            deleteTopic :deleteTopic
          });
        }
      }
    );
  },

  search: function (req,res) {

      // Sacar string a buscar de la url

      var searchString = req.params.search;

      // Find con un operador or

      Topic.find( {

        "$or":[

          {"title"  :{ "$regex": searchString, "$options": "i"}},
          {"content":{ "$regex": searchString, "$options": "i"}},
          {"code"   :{ "$regex": searchString, "$options": "i"}},
          {"lang"   :{ "$regex": searchString, "$options": "i"}}


        ]

      }).sort([["date", "descending"]]).exec((err,topics) => {
       
        if (err) {
          return res.status(500).send({
            status: "error",
            message: "Error en la petición"
          });
        } else if(!topics) {
          return res.status(404).send({
            status: "error",
            message: "No hay temas disponibles"
          });

          
        }else{

          return res.status(200).send({
            status: "success", 
           topics:topics
          });

        }

      });
      
      // Devolver resultado

    
  }
};

module.exports = controller;
