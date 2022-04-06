"use strict";

const mongoose = require("mongoose");
const app = require('./app');

const port = process.env.PORT  || 3999;


//conexion a la base de datos
// mongoose.set('useFindAndModify',false);
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost:27017/api_rest_node", { useNewUrlParser: true })
  .then(() => {
    console.log(
      "Conexion a la base de datos de mongoDB se ha realizado correctamente!!!" 
    );

        //crear el servidor

        app.listen(port, ()=>{

            console.log("El Servidor esta corriendo correctamente por el puerto, "+ port)

        })

  })
  .catch((err) => console.log(err));
