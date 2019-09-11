// Archivo para la ruta principal

var express = require('express');

//levantar la app
var app = express();

//modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ====================================================================================================================
// Busqueda por coleccion
// =====================================================================================================================

app.get('/coleccion/:tabla/:buqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {

        case 'usuarios':
            promise = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promise = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promise = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: Usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido' }
            });
    }

    promise.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });

    });

});


// ====================================================================================================================
// Busqueda general
// =====================================================================================================================


/*  Para realizar varias busquedas simultaneamente lo que se debe hacer es crear procesos asincronos y esperar que todos
    Estos procesos respondan para poder retornar el mensaje o respuesta con todo lo que se quiso buscar*/

// Rutas
//get define el path ('/') y el callback function que recibe tres parametros request, response, next
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });


    // mandar las respuestas a las solicitudes
});

// Transformar la respuesta en promesa para hacer la busqueda con procesos asincronos

function buscarHospitales(busqueda, regex) {

    //crear una promesa e inmediaramente retornar
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {

    //crear una promesa e inmediaramente retornar
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar ,medicos');
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuarios(busqueda, regex) {

    //crear una promesa e inmediaramente retornar
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error al cargar usuario', err);
                } else {
                    resolve(usuarios);
                }
            });

    });
}

// Para poder utilizar cualquier cosa fuera de un archivo en particular se debe exportar
module.exports = app;