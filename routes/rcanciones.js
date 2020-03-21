module.exports = function (app, swig, gestorDB) {

    app.get("/canciones", function (req, res) {
        var canciones = [{
            "nombre": "Blanck space",
            "precio": "1.2"
        }, {
            "nombre": "See you again",
            "precio": "1.3"
        }, {
            "nombre": "Uptown Funk",
            "precio": "1.1"
        }];

        var respuesta = swig.renderFile('views/btienda.html', {
            vendedor: 'Tienda de canciones',
            canciones: canciones
        });
        res.send(respuesta);
    })

    app.get('/canciones/agregar', function (req, res) {
        if( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    })

    app.get('/cancion/:id', function (req, res) {
        let criterio = { "_id" : gestorDB.mongo.ObjectID(req.params.id) };

        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancion.html',
                    {
                        cancion: canciones[0]
                    });
                res.send(respuesta);
            }
        });
    })

    app.get('/suma', function (req, res) {
        let respuesta = parseInt(req.query.num1)
            + parseInt(req.query.num2);
        res.send(String(respuesta));
    })

    app.get('/canciones/:genero/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id + '<br>'
            + 'Género: ' + req.params.genero;
        res.send(respuesta);
    })

    app.post("/cancion", function (req, res) {
        if( req.session.usuario == null){
            res.redirect("/tienda");
            return;
        }
        let cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: req.session.usuario
        }
        // Conectarse
        gestorDB.insertarCancion(cancion,
            function (id) {
                if (id == null) {
                    res.send("Error al insertar ");
                } else {
                    if (req.files.portada != null) {
                        let imagen = req.files.portada;
                        imagen.mv('public/portadas/' + id + '.png', function (err) {
                            if (err) {
                                res.send("Error al subir la portada");
                            } else {
                                if (req.files.audio != null) {
                                    let audio = req.files.audio;
                                    audio.mv('public/audios/' + id + '.mp3', function (err) {
                                        if (err) {
                                            res.send("Error al subir el audio");
                                        } else {
                                            res.send("Agregada id:  " + id);
                                        }
                                    })
                                }
                            }
                        });
                    }
                }
            });
    })

    app.get("/tienda", function (req, res) {
        let criterio = {};
        if (req.query.busqueda != null) {
            criterio = {"nombre": {$regex: ".*" + req.query.busqueda + ".*"}};
        }
        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/btienda.html', {
                    canciones: canciones
                });
                res.send(respuesta);
            }
        });
    });
};