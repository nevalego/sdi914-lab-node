// Módulos
let express = require('express');
let app = express();

let fileUpload = require('express-fileupload');
app.use(fileUpload());
let mongo = require('mongodb');
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

let gestorDB = require("./modules/gestorDB.js");
gestorDB.init(app, mongo);
// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:Sumpeti4@tiendamusica-shard-00-00-nukgt.mongodb.net:27017,tiendamusica-shard-00-01-nukgt.mongodb.net:27017,tiendamusica-shard-00-02-nukgt.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true&w=majority');


//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorDB); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig, gestorDB);
require("./routes/rautores.js")(app, swig);

// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});