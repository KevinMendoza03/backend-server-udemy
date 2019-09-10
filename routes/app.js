// Archivo para la ruta principal

var express = require('express');

//levantar la app
var app = express();


// Rutas
//get define el path ('/') y el callback function que recibe tres parametros request, response, next
app.get('/', (req, res, next) => {

    // mandar las respuestas a las solicitudes
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// Para poder utilizar cualquier cosa fuera de un archivo en particular se debe exportar
module.exports = app;