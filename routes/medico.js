// Archivo para la ruta principal

var express = require('express');

var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//modelo del hospital
var Medico = require('../models/medico');

// ====================================================================
// Obtener todos los medicos
// ====================================================================
// Rutas
//get define el path ('/') y el callback function que recibe tres parametros request, response, next
app.get('/', (req, res, next) => {

    // Para paginar los resultados junto al .skip(desde) y .limit(5)
    var desde = req.query.desde || 0;
    desde = Number(desde);

    // para cuando alguien haga un get a la ruta de medicos se hace lo siguiente
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    // mandar las respuestas a las solicitudes
                    //Para que muestre todos los medicos si no hay errores
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            });


});


// ====================================================================
// Actualizar medico 
// ====================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // Verificar si un medico existe con ese id
    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        // Evaluar si viene un medico
        // si no viene un medico es !medico
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe medico con es ID' }
            });
        }

        // si hay medico
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});


// ====================================================================
// Crear un medico nuevo
// ====================================================================
// instalacion body parser: npm install body-parser --save
// Es una libreria que toma la informacion del post y nos crea un objeto
// de javascript que ya podemos utilizar 
// despues importar la libreria en nuestra aplicacion en el app.js con la siguiente linea
// var bodyParser = require('body-parser')

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        // Aqui es diferente por que el hospital se escoge no como el usuario que es con el que se trabaja en el sistema
        hospital: body.hospital

    });

    // Este callback es una funcion que regresa cuando se guarda el medico
    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });
    });

});

// ====================================================================
// Borrar un medico por el ID
// ====================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Medico.findByIdAndDelete(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese ID',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });

});

module.exports = app;