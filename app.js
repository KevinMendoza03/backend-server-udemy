// Requires, basicamente es una importacion de librerias ya sea de terceros o personalizadas, que ocupamos para que funcione algo
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')


// Inicializar variables
var app = express();

// Configuracion Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



// Importar rutas

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online')

})

// Server index config se instala cn el comando npm install serve-index
/*var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));
*/




// Rutas
// Middleware es algo que se ejecuta antes de que se resuelvan otras rutas

app.use('/img', imagenesRoutes);
app.use('/upload', uploadRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/login', loginRoutes);


app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online')
})