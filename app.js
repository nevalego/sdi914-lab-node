// Módulos
let express = require('express');
let app = express();

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
let crypto = require('crypto');
let fileUpload = require('express-fileupload');
app.use(fileUpload());
let mongo = require('mongodb');
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let gestorDB = require("./modules/gestorDB.js");
gestorDB.init(app, mongo);

// routerUsuarioSession
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino);
        res.redirect("/identificarse");
    }
});

//Aplicar routerUsuarioSession
app.use("/canciones/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);
app.use("/comentarios",routerUsuarioSession);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
    // Cuidado porque req.params no funciona
    // en el router si los params van en la URL.
    gestorDB.obtenerCanciones(      {_id: mongo.ObjectID(id) },
        function (canciones) {
        console.log(canciones[0]);
        if(canciones[0].autor == req.session.usuario ){
            next();
        } else {
            res.redirect("/tienda");
        }
    })
});

//Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);

//routerAudios
let routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    gestorDB.obtenerCanciones(
        {"_id": mongo.ObjectID(idCancion) },
        function (canciones) {
            if(req.session.usuario && canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});

//Aplicar routerAudios
app.use("/audios/",routerAudios);

// Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:Sumpeti4@tiendamusica-shard-00-00-nukgt.mongodb.net:27017,tiendamusica-shard-00-01-nukgt.mongodb.net:27017,tiendamusica-shard-00-02-nukgt.mongodb.net:27017/test?ssl=true&replicaSet=tiendamusica-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave', 'abcdefg');
app.set('crypto', crypto);

//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig, gestorDB); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app, swig, gestorDB);
require("./routes/rcomentarios.js")(app, swig, gestorDB);
require("./routes/rautores.js")(app, swig);

app.use(express.static('public'));

// lanzar el servidor
app.listen(app.get('port'), function () {
    console.log("Servidor activo");
});