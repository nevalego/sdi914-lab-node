module.exports = function (app, gestorBD) {
    app.get("/api/cancion", function (req, res) {
        gestorBD.obtenerCanciones({}, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones));
            }
        });
    });
    app.get("/api/cancion/:id", function (req, res) {
        var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({error: "se ha producido un error"})
            } else {
                res.status(200);
                res.send(JSON.stringify(canciones[0]));
            }
        });
    });
    app.delete("/api/cancion/:id", function (req, res) {

        var token = req.headers['token'] || req.body.token
            || req.query.token;
        if (token == null ){
            res.status(500);
            res.send(JSON.stringify({error: "Se debe logear"}));
        } else {

            var criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
            gestorBD.eliminarCancion(criterio, function (canciones) {
                if (canciones == null) {
                    res.status(500);
                    res.json({error: "se ha producido un error"});
                } else{
                    // No es el autor
                    if ( canciones.autor == req.session.usuario ){
                        res.status(500);
                        res.send(JSON.stringify({error: "Sólo el autor puede eliminar la canción"}));
                    } else {
                        res.status(200);
                        res.send(JSON.stringify(canciones));
                    }
                }
            });
        }
    });
    app.post("/api/cancion", function (req, res) {

        var token = req.headers['token'] || req.body.token
            || req.query.token;
        if (token == null ){
            res.status(500);
            res.send(JSON.stringify({error: "Se debe logear"}));
        } else {
            var cancion = {};

            if (req.body.nombre != null && req.body.genero != null && req.body.precio != null){
                // ¿Validar nombre, genero, precio?
                if (req.body.nombre.length >= 4 && req.body.precio > 0) {
                    cancion = {nombre: req.body.nombre, genero: req.body.genero, precio: req.body.precio,}

                    gestorBD.insertarCancion(cancion, function (id) {
                        if (id == null) {
                            res.status(500);
                            res.json({error: "se ha producido un error"})
                        } else {
                            res.status(201);
                            res.json({mensaje: "canción insertarda", _id: id})
                        }
                    });
                }
                else{
                    res.status(500);
                    res.send(JSON.stringify({error: "El nombre debe tener al menos 4 caracteres y el precio mayor a 0"}));
                }
            }else{
                res.status(500);
                res.send(JSON.stringify({error: "No debe haber ningún campo vacío"}));
            }
        }
    });
    app.put("/api/cancion/:id", function (req, res) {

        var token = req.headers['token'] || req.body.token
        || req.query.token;
        if (token == null ){
            res.status(500);
            res.send(JSON.stringify({error: "Se debe logear"}));
        }else {
            let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
            let cancion = {}; // Solo los atributos a modificar
            if (req.body.nombre != null) {
                if (req.body.nombre.length < 4) {
                    res.status(500);
                    res.send(JSON.stringify({error: "El nombre debe tener al menos 4 caracteres"}));
                } else {
                    cancion.nombre = req.body.nombre;
                }
            }
            if (req.body.genero != null) {
                cancion.genero = req.body.genero;
            }
            if (req.body.precio != null) {
                if (req.body.precio <= 0) {
                    res.status(500);
                    res.send(JSON.stringify({error: "El precio debe ser mayor a 0"}));
                } else {
                    cancion.precio = req.body.precio;
                }
            }
            if ( cancion.autor == req.session.usuario){
                res.status(500);
                res.json({error: "Sólo el autor puede modificar la canción"});
            }else {
                gestorBD.modificarCancion(criterio, cancion, function (result) {
                    if (result == null) {
                        res.status(500);
                        res.json({error: "se ha producido un error"})
                    } else {
                        res.status(200);
                        res.json({mensaje: "canción modificada", _id: req.params.id})

                    }
                });
            }
        }
    });
    app.post("/api/autenticar/", function(req, res) {
       let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
           .update(req.body.password).digest('hex');

       let criterio = {
           email : req.body.email,
           password : seguro
       }

       gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if ( usuarios == null || usuarios.length == 0){
                res.status(401); // unauthorized
                res.json({
                    autenticado: false
                })
                }else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email ,
                    tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true,
                    token: token
                })
            }
       });
    });
}