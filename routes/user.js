"use strict";

const express = require("express");
const UserController = require("../controllers/user");

const router = express.Router();
const md_auth = require("../middleware/authenticated");

//para la carga de imagenes

const multipart = require('connect-multiparty');
const md_upload = multipart({uploadDir: './uploads/users'});


router.post("/registerUser", UserController.save);
router.post("/loginUser", UserController.login);
router.put("/updateUser", md_auth.authenticated, UserController.update);


router.post("/updateAvatar/:id", [md_auth.authenticated,md_upload], UserController.uploadAvatar);
router.get("/avatar/:imageName",UserController.avatar);

router.get("/users/",md_auth.authenticated,UserController.getUsers);
router.get("/user/:userId",md_auth.authenticated,UserController.getUser);




//rutas de prueba
router.get("/probando", UserController.probando);
router.post("/testeando", UserController.testeando);

module.exports = router;
