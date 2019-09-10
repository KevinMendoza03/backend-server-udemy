// Archivo para la ruta principal

var express = require('express');

// Para poder encriptar la contraseña usando el metodo de una sola via
// Esto se debe poner donde se haga el POST
// instalar npm install bcryptjs
var bcrypt = require('bcryptjs');

// para poder crear un token se debe importar la libreria del jwt
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

//modelo del usuario
var Usuario = require('../models/usuario');

// Metodo del login
app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Para no mandar el password en el token
        usuarioBD.password = ':)';

        // Crear token se debe instalar con el comando npm install jsonwebtoken --save *recordar antes de instalar bajar el npm start*
        // Sirve para verificacion de las trespeticiones, put, post, delete

        // Creacion
        // Recibe los parametros: 
        // - primero: Es la data que quiero colocar en el token, se conoce como payload
        // - segundo: SEED o semilla, es algo que debemos definir de manera unica ejemplo: '@este-es-un-seed'
        // - tercero: Parametro de fecha de expiracion del token
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 horas = 14400


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token: token,
            id: usuarioBD.id
        });
    });

});

/* Nota : los token no se los usa en el front-end sino en el lado del servidor, toda la data que se reciba de cualquier aplicacion de js 
          se tiene que validar en el back-end, si esto no es valido entonces se debe rechazar ese token
*/


module.exports = app;