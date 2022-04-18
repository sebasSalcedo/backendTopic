"use strict";

const Topic = require("../models/topic");
const validator = require("validator");

const controller = {
  add: function (req, res) {
    // Recoger el id del topic de la url

    var topicId = req.params.topicId;

    // Find por id del topic

    Topic.findById(topicId).exec((err, topic) => {
      if (err) {
        return res.status(500).send({
          statuss: "error",
          message: "Error en la petición",
          error: err,
        });
      } else if (!topic) {
        return res.status(405).send({
          statuss: "error",
          message: "No existe el topic",
          error: err,
        });
      } else {
        // Comprobrar objeto usuario y validar datos

        if (req.body.content) {
          try {
            var validate_content = !validator.isEmpty(req.body.content);
          } catch (err) {
            return res.status(400).send({
              status: "error",
              message: "Faltan datos por validar.",
              error: err,
            });
          }

          if (!validate_content) {
            return res.status(400).send({
              status: "error",
              message: "No se ha validado los datos del comentario!!!",
            });
          } else {
            var comment = {
              user: req.user.sub,
              content: req.body.content,
            };

            // En la propiedad comments del objeto resultante hacer un push

            topic.comments.push(comment);
            // Guardar el topic completo
            topic.save((err) => {
              // Devolver respuest
              if (err) {
                return res.status(500).send({
                  status: "error",
                  message: "No se ha logrado guardar el comentario",
                  error: err,
                });
              } else {
                return res.status(200).send({
                  status: "success",
                  message: "Se ha generado un nuevo comentario.",
                  topic: topic,
                });
              }
            });
          }
        }
      }
    });
  },

  update: function (req, res) {
    // Conseguir id de comentario que llega de la url

    var commentId = req.params.commentId;

    // Recoger datos y validar

    var params = req.body;

    try {
      var validate_content = !validator.isEmpty(params.content);
    } catch (err) {
      return res.status(400).send({
        status: "error",
        message: "Faltan datos por validar.",
        error: err,
      });
    }

    if (validate_content) {
      // Find and update

      Topic.findOneAndUpdate(
        { "comments._id": commentId },
        {
          $set: {
            "comments.$.content": params.content,
          },
        },
        { new: true },
        (err, topicUpdate) => {
          if (err) {
            return res.status(404).send({
              message: "Se ha presentado un error en la petición",
              error: err,
            });
          } else if (!topicUpdate) {
            return res.status(404).send({
              message: "No se ha logrado realizar la actualización",
            });
          } else {
            return res.status(200).send({
              message: "Se ha actualizado el comentario",
              data: topicUpdate,
            });
          }
        }
      );

      // Devolver los datos
    }
  },

  delete: function (req, res) {
    // Sacar el id del topic y del comentario a borrar

    var topicId = req.params.topicId;
    var commentId = req.params.commentId;
    // Buscar el Topic

    Topic.findById(topicId, (err, topic) => {
        console.log(err, topic)
      if (err) {
        return res.status(404).send({
          message: "Se ha presentado un error en la petición",
          error: err,
        });
      } else if (!topic) {
        return res.status(404).send({
          message: "No se ha logrado eliminar el comentario",
          error: err,
          topic
        });
      } else {
        // Seleccionar el subdocumento (Comentario)

        var comment = topic.comments.id(commentId);

        if (comment) {
          comment.remove();
          // Guardar el Topic

          topic.save((err) => {
            if (err) {
              return res.status(404).send({
                message: "Se ha presentado un error en la petición",
                error: err,
              });
            } else {
              // Devolver un resultado

              return res.status(200).send({
                message: "Se ha eliminado correctamente el comentariop",
              });
            }
          });
        } else {
          return res.status(404).send({
            message: "No existe el comentario",
          });
        }
      }
    });
  },
};

module.exports = controller;
