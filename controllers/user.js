"use strict";

const validator = require("validator");
const { param } = require("../app");
const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user");

const jwt = require("../services/jwt");
const user = require("../models/user");

const fs = require("fs");
const path = require("path");
const { find } = require("../models/user");

var controller = {
  probando: function (req, res) {
    return res.status(200).send("<h1>hola mundo soy node</h1>");
  },

  testeando: function (req, res) {
    return res.status(200).send({
      message: "Soy el metodo testeando",
    });
  },

  /**
   * Metodo de registro de un nuevo usuario
   * @param {*} req, datos que se envian por la request
   * @param {*} res, respuesta del servidor
   * @returns retorna el tipo de mensaje dependiendo del tipo de validación
   */

  save: function (req, res) {
    // 1. Recoger los parametros de la petición

    var params = req.body;
    console.log(req.body);
    // 2. Validar los datos
    try {
      var validate_name     = !validator.isEmpty(params.name);
      var validate_surname  = !validator.isEmpty(params.surname);
      var validate_email    =  !validator.isEmpty(params.email) && validator.isEmail(params.email);
      var validate_password = !validator.isEmpty(params.password);
    } catch (err) {
      return res.status(400).send({
        message: "Faltan datos por enviar",
      });
    }

    if (
      validate_name &&
      validate_surname &&
      validate_email &&
      validate_password
    ) {
    } else {
      return res.status(400).send({
        message: "Validación de los datos incorrectos, intentalo de nuevo",
      });
    }

    // 3. Crear el objeto de usuario

    var user = new User();

    // 4. Asignar valores al usuario

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email.toLowerCase();
    user.role = "ROLE_USER";
    user.image = null;

    // 5. Comprobar si el usuario existe

    User.findOne({ email: user.email }, (err, issetUser) => {
      if (err) {
        return res.status(500).send({
          message: "Error al comprobrar duplicidad el usuario",
        });
      }
      if (!issetUser) {
        // 6. Si no Existe , cifrar la contraseña y guardar los datos

        bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash;

          // Guardar el usuario

          user.save((err, resUser) => {
            if (err) {
              return res.status(400).send({
                message: "Error al guardar el usuario",
                user,
              });
            } else if (!resUser) {
              return res.status(400).send({
                message: "El usuario no se ha guardado",
                user,
              });
            }
            return res.status(200).send({
              message: "se ha guardado correctamente el usuario",
              user,
            });
          });
        });

        // 7. Devolver respuesta
      } else {
        return res.status(500).send({
          message: "El usuario ya se encuentra registrado",
        });
      }
    });
  },

  /**
   * Metodo que permite loguearse, como tambien generar el token de autenticación
   * @param {*} req, datos que se envian desde el formulario.
   * @param {*} res , respuesta de del servidor
   * @returns
   */

  login: function (req, res) {
    //Recoger los parametros de la petición

    var params = req.body;

    // Validar los datos
    try {
      var validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
      var validate_password = !validator.isEmpty(params.password);
    } catch (err) {
      return res.status(400).send({
        message: "Faltan datos por enviar",
      });
    }

    if (validate_email && validate_password) {
      // Buscar usuarios que coincidan con el email

      User.findOne({ email: params.email.toLowerCase() }, (err, user) => {
        if (err) {
          return res.status(500).send({
            message: "Error al intentar identificarse",
          });
        }
        if (!user) {
          return res.status(500).send({
            message: "Email y/o contraseña no coinciden",
          });
        }

        else{
          bcrypt.compare(params.password, user.password, (err, check) => {
            if (err) {
              return res.status(500).send({
                message: "Se ha presentado un error a validar la contraseña",
              });
            }

            let dataUser = user;
            if (check) {
              // Generar token de jwt y devolverlo
  
              if (user) {
                // Devolver los datos
  
                return res.status(200).send({
                  user:dataUser,

                  token: jwt.createToken(user),
                });
              } else {
                //quitar datos que se envian en la respuesta del objeto
  
                user.password = undefined;
  
                // Devolver los datos
  
                return res.status(200).send({
                  message: "Success",
                  user:dataUser
                  
                });
              }
            } else {
              return res.status(500).send({
                message: "Contraseña incorrecta",
                
              });
            }
          });
        }

      
      });
    } else {
      return res.status(500).send({
        message: "Los datos estan incorrectos",
      });
    }
  },

  /**
   * Metodo que permite actualizar los datos del usuario
   * @param {*} req
   * @param {*} res
   * @returns
   */

  update: function (req, res) {
    // Recoger datos que llegan de la req

    var params = req.body;

    // validar datos

    try {
      var validate_name = !validator.isEmpty(params.name);
      var validate_surname = !validator.isEmpty(params.surname);
      var validate_email =
        !validator.isEmpty(params.email) && validator.isEmail(params.email);
    } catch (err) {
      return res.status(400).send({
        message: "Faltan datos por enviar",
        params,
      });
    }

    // Eliminar propiedades innecesarias

    delete params.password;
    // Buscar y Actualizar documento

    var userId = req.user.sub;
    //comprobar si el email es unico

    if (req.user.email != params.email) {
      User.findOne({ email: params.email }, (err, issetUser) => {
        if (err) {
          return res.status(500).send({
            message: "Error al actualizar el correo",
          });
        }

        if (!issetUser) {
          User.findOneAndUpdate(
            { _id: userId },
            params,
            { new: true },
            (err, userUpdated) => {
              if (err) {
                return res.status(500).send({
                  message: "Error al actualizar",
                });
              }
              if (!userUpdated) {
                return res.status(200).send({
                  status: "Error",
                  message: "No se ha actualizado el usuario",
                });
              }

              return res.status(200).send({
                message: "success",
                user: userUpdated,
              });
            }
          );

          // 7. Devolver respuesta
        } else {
          return res.status(500).send({
            message: "Email ya se encuentra registrado",
          });
        }
      });
    } else {
      User.findOneAndUpdate(
        { _id: userId },
        params,
        { new: true },
        (err, userUpdated) => {
          if (err) {
            return res.status(500).send({
              message: "Error al actualizar",
            });
          }
          if (!userUpdated) {
            return res.status(200).send({
              status: "Error",
              message: "No se ha actualizado el usuario",
            });
          }

          return res.status(200).send({
            message: "success",
            user: userUpdated,
          });
        }
      );
    }
  },

  /**
   * Guardar el avatar del usuario nuevo
   * @param {*} req
   * @param {*} res 
   * @returns 
   */

  uploadAvatar: function (req, res) {
    // recoger el fichero de la petición

    var file_name = "Avatar no subido..";

    if (!req.files) {
      return res.status(404).send({
        status: "Error",
        message: " Error al subir el avatar",
      });
    } else {
      var file_path = req.files.file0.path;
      var file_name = file_path.split("\\")[2];
      // Conseguir el nombre y la extension del archivo subido

      // Conseguir la extension
      var file_ext = file_name.split(".")[1];
      // comprobar extension ( Solo imagenes ), si no es valida eliminar fichero
      if (
        file_ext != "png" &&
        file_ext != "jpg" &&
        file_ext != "jpeg" &&
        file_ext != "gif"
      ) {
        fs.unlink(file_path, (err) => {
          return res.status(404).send({
            status: "Error",
            message: "Elemento no valido",
          });
        });
      } else {
        // Comprobar que el usuario este identificado y obtener el id de user

        var userId = req.user.sub;

        // Buscar y actualizar documento de la base de datos

        User.findOneAndUpdate(
          { _id: userId },
          { image: file_name },
          { new: true },
          (err, userUpdated) => {
            if (err || !userUpdated) {
              return res.status(500).send({
                status: "Error",
                message: "error al guardar el avatar del usuario",
              });
            } else {
              // Devolver una respuesta
              return res.status(200).send({
                status: "Success",
                message: "Se ha subido el Avatar",
                user: userUpdated,
              });
            }
          }
        );
      }
    }
  },
  /**
   * Obtener el avatar del usuario 
   * @param {} req 
   * @param {*} res 
   */

  avatar:function (req,res) {
   
    var fileName = req.params.imageName;
    var pathFile = './uploads/users/'+fileName;
   
    fs.exists(pathFile, (exists) =>{

      if (exists) {

       return res.sendFile(path.resolve(pathFile));
        
      }else{
        return res.status(404).send({
          status: "Error",
          message: "La image no Existe"
        });
      }

    })
    
  },


  getUsers:function (req,res) {

    User.find().exec((err, users) => {

      if(err ){

        return res.status(404).send({
          status: "Error",
          message: "Se presento un error al consultar los usuarios"
        });
      }else if(!users){


        return res.status(404).send({
          status: "Error",
          message: "No hay usuario que mostrar"
        });

      }else{

        return res.status(200).send({
          status: "success",
          users:users
        });

      }

    })
  },

  getUser:function (req,res) {

    var userId = req.params.userId;


    User.findById(userId).exec((err,user) =>{

      console.log(err)
      console.log(user)

      if(err ){

        return res.status(404).send({
          status: "Error",
          message: "Se presento un error al consultar el usuario"
        });
      }else if(!user){


        return res.status(404).send({
          status: "Error",
          message: "No existe el usuario"
        });

      }else{

        return res.status(200).send({
          status: "success",
          user:user
        });

      }


    });
    
  }


  
};

module.exports = controller;
