// Archivo para la ruta principal

var express = require('express');

// Para poder encriptar la contraseña usando el metodo de una sola via
// Esto se debe poner donde se haga el POST
// instalar npm install bcryptjs
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//modelo del usuario
var Usuario = require('../models/usuario');

// ====================================================================
// Obtener todos los usuarios
// ====================================================================
// Rutas
//get define el path ('/') y el callback function que recibe tres parametros request, response, next
app.get('/', (req, res, next) => {

    // para cuando alguien haga un get a la ruta de usarios se hace lo siguiente
    //lo que dice la linea de abajo es busca todos losregtros de la tabla de usuarios con solo esos campos
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                // mandar las respuestas a las solicitudes
                //Para que muestre todos los usarios si no hay errores
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });


});


// ====================================================================
// Actualizar usuario 
// ====================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // Verificar si un usuario existe con ese id
    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        // Evaluar si viene un usuario
        // si no viene un usuario es !usuario
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe usuario con es ID' }
            });
        }

        // si hay usuario
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


// ====================================================================
// Crear un usuario nuevo
// ====================================================================
// instalacion body parser: npm install body-parser --save
// Es una libreria que toma la informacion del post y nos crea un objeto
// de javascript que ya podemos utilizar 
// despues importar la libreria en nuestra aplicacion en el app.js con la siguiente linea
// var bodyParser = require('body-parser')

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        // bcrypt.hashSync es para poder encriptar y se lo hace de la siguiente manera
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    // Este callback es una funcion que regresa cuando se guarda el usuario
    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ====================================================================
// Borrar un usuario por el ID
// ====================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe usuario con ese ID',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;