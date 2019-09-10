//para crear el modelo de usuarios

var mongoose = require('mongoose');

// plugin para que se vea mejor la validacion por ejemplo del correo cuando se repite 
// instalar en la terminal con el comando npm install mongoose-unique-validator --save
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Objeto que permite controlar cuales son los roles permitidos
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};



var usuarioSchema = new Schema(
    //objeto de javaScript
    {

        nombre: { type: String, required: [true, 'El nombre es necesario'] },
        email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
        password: { type: String, required: [true, 'La contraseña es necesario'] },
        img: { type: String, required: false },
        role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
    });

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser unico' });


// Para usar el esquema usuarioSchema se necesita exportarlo
module.exports = mongoose.model('Usuario', usuarioSchema);
// Usuario es el nombre que quiero que tenga este esquema, usuarioSchema es el objeto que yo quiero que relacione