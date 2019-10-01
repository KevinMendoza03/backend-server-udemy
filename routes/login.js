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


// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');


// ==============================================================
// Para renovar token
// ==============================================================

app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 }); //4 horas = 14400

    res.status(200).json({
        ok: true,
        token: token
    })

});



// ==============================================================
// Autenticacion de google
// ==============================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}


app.post('/google', async(req, res) => {

    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });

    // Verificar si el correo del usuario ya lo tiene en la BD
    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioBD) {

            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                    errors: err
                });
            } else {

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 horas = 14400

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            }

        } else {
            // El usuario no existe ....  hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ":)";

            usuario.save((err, usuarioBD) => {

                var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); //4 horas = 14400

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token: token,
                    id: usuarioBD.id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            });
        }

    });



    /*
        return res.status(200).json({
            ok: true,
            mensaje: 'ok',
            googleUser: googleUser
        });*/


});


// ==============================================================
// Autenticacion normal
// ==============================================================
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
            id: usuarioBD.id,
            menu: obtenerMenu(usuarioBD.role)
        });
    });

});

/* Nota : los token no se los usa en el front-end sino en el lado del servidor, toda la data que se reciba de cualquier aplicacion de js 
          se tiene que validar en el back-end, si esto no es valido entonces se debe rechazar ese token
*/

function obtenerMenu(ROLE) {

    var menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'RxJs', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }
    return menu;
}

module.exports = app;