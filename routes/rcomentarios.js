module.exports = function (app, swig, gestorDB) {

    app.post("/comentarios/:cancion_id", function (req, res) {

        let id = req.params.id;
        let criterio = {"_id": gestorDB.mongo.ObjectID(id)};
        let cancion = null;

        gestorDB.obtenerCanciones(criterio, function (canciones) {
            if (canciones == null) {
                res.send(respuesta);
            } else {
                cancion = canciones[0];
                }
            });

        if( req.session.usuario != null) {
            comentario = {
                autor: req.session.usuario,
                texto: req.body.texto,
                cancion_id: gestorDB.mongo.ObjectID(id)
            }

            // Insertar comentario
            gestorDB.insertarComentario(comentario, function (id) {
                if (id == null) {
                    res.send("Error al insertar comentario ");
                }
            });

            // Obtener comentarios
            criterio = {"cancion_id": id};
            gestorDB.obtenederComentarios(criterio, cancion, function (comentarios) {
                if (result == null) {
                    res.send("Error al obtener comentarios ");
                } else {
                    let respuesta = swig.renderFile('views/bcancion.html', {
                        cancion: cancion,
                        comentarios: comentarios
                    });
                    res.send(respuesta);
                }
            });
        } else {
            res.send("Error: Usuario no logeado");
        }
    })
}