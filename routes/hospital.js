// Archivo para la ruta principal

var express = require('express');

var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//modelo del hospital
var Hospital = require('../models/hospital');

// ====================================================================
// Obtener todos los hospitales
// ====================================================================
// Rutas
//get define el path ('/') y el callback function que recibe tres parametros request, response, next
app.get('/', (req, res, next) => {

    // Para paginar los resultados junto al .skip(desde) y .limit(5)
    var desde = req.query.desde || 0;
    desde = Number(desde);

    // para cuando alguien haga un get a la ruta de hospitales se hace lo siguiente
    Hospital.find({})
        // funcion de mongoose para especificar que tabla y que campos  queremos de la otra tabla o coleccion
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {


                    // mandar las respuestas a las solicitudes
                    //Para que muestre todos los usarios si no hay errores
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });


});


// ====================================================================
// Actualizar hospital 
// ====================================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // Verificar si un hospital existe con ese id
    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        // Evaluar si viene un hospital
        // si no viene un hospital es !hospital
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe hospital con es ID' }
            });
        }

        // si hay hospital
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});


// ====================================================================
// Crear un hospital nuevo
// ====================================================================
// instalacion body parser: npm install body-parser --save
// Es una libreria que toma la informacion del post y nos crea un objeto
// de javascript que ya podemos utilizar 
// despues importar la libreria en nuestra aplicacion en el app.js con la siguiente linea
// var bodyParser = require('body-parser')

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id

    });

    // Este callback es una funcion que regresa cuando se guarda el hospital
    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });
    });

});

// ====================================================================
// Borrar un hospital por el ID
// ====================================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    Hospital.findByIdAndDelete(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe hospital con ese ID',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });

});

module.exports = app;