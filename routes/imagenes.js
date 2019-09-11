// Archivo para la ruta principal

var express = require('express');

//levantar la app
var app = express();

const path = require('path');

const fs = require('fs');

// Rutas
//get define el path ('/') y el callback function que recibe tres parametros request, response, next
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    // direccion completa para encontrar la imagen
    var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }`);


    // verificar si el path es valido
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        var pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImagen);
    }
    // verificar si esa imagen existe en ese path

});

// Para poder utilizar cualquier cosa fuera de un archivo en particular se debe exportar
module.exports = app;