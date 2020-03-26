module.exports = function (app, swig, gestorDB) {

    app.get('/canciones/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/bagregar.html', {});
        res.send(respuesta);
    })

    app.get('/cancion/:id', function (req, res) {
        let criterio = {
            "cancion_id": gestorDB.mongo.ObjectID(req.params.id)
        };
        let comentarios = [];

        gestorDB.obtenederComentarios(criterio, function (result) {
            if (result == null) {
                res.send("Error al obtener comentarios cancion");
            } else {
                comentarios = result;
            }
        });
        criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)};
        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al obtener cancion");
            } else {
                let respuesta = swig.renderFile('views/bcancion.html',
                    {
                        cancion: canciones[0],
                        comentarios: comentarios
                    });
                res.send(respuesta);
            }
        });
    })

    app.get('/cancion/eliminar/:id', function (req, res) {
        let criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)};
        gestorDB.eliminarCancion(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones");
            }
        });
    })

    app.get('/cancion/modificar/:id', function (req, res) {
        let criterio = {"_id": gestorDB.mongo.ObjectID(req.params.id)};
        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/bcancionModificar.html', {
                    cancion: canciones[0]
                });
                res.send(respuesta);
            }
        });
    })

    app.get('/cancion/comprar/:id', function (req, res) {
        let cancionId = gestorDB.mongo.ObjectID(req.params.id);
        let compra = {usuario: req.session.usuario, cancionId: cancionId}
        gestorDB.insertarCompra(compra, function (idCompra) {
            if (idCompra == null) {
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    })

    app.get('/compras', function (req, res) {
        let criterio = {"usuario": req.session.usuario};
        gestorDB.obtenerCompras(criterio, function (compras) {
            if (compras == null) {
                res.send("Error al listar");
            } else {
                let cancionesCompradasIds = [];
                for (i = 0; i < compras.length; i++) {
                    cancionesCompradasIds.push(compras[i].cancionId);
                }
                let criterio = {"_id": {$in: cancionesCompradasIds}}
                gestorDB.obtenerCanciones(criterio, function (canciones) {
                    let respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones: canciones
                        });
                    res.send(respuesta);
                })
            }
        })
    })

    app.post('/cancion/modificar/:id', function (req, res) {
        let id = req.params.id;
        let criterio = {"_id": gestorDB.mongo.ObjectID(id)};
        let cancion = {
            nombre: req.body.nombre, genero: req.body.genero,
            precio: req.body.precio
        }

        gestorDB.modificarCancion(criterio, cancion, function (result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                paso1ModificarPortada(req.files, id, function (result) {
                    if (result == null) {
                        res.send("Error en la modificación");
                    } else {
                        res.redirect("/publicaciones");
                    }
                });
            }
        });
    })

    function paso1ModificarPortada(files, id, callback) {
        if (files && files.portada != null) {
            let imagen = files.portada;
            imagen.mv('public/portadas/' + id + '.png', function (err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback);
                    // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback);
            // SIGUIENTE
        }
    };

    function paso2ModificarAudio(files, id, callback) {
        if (files && files.audio != null) {
            let audio = files.audio;
            audio.mv('public/audios/' + id + '.mp3', function (err) {
                if (err) {
                    callback(null);
                    // ERROR
                } else {
                    callback(true);
                    // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    };

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
                                            res.redirect("/publicaciones");
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

        let pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        gestorDB.obtenerCancionesPg(criterio, pg,
            function (canciones, total) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total/4;
                if (total % 4 > 0) {
                    // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = [];
                // paginas mostrar
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/btienda.html',
                    {
                        canciones : canciones,
                        paginas : paginas,
                        actual : pg
                    });
                res.send(respuesta);
                }
            });
    });

    app.get("/publicaciones", function (req, res) {
        let criterio = {autor: req.session.usuario};

        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/bpublicaciones.html', {canciones: canciones});
                res.send(respuesta);
            }
        });
    });
}