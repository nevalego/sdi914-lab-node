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
            let cancion_id = req.params.cancion_id;
            comentario = {
                autor: req.session.usuario,
                texto: req.body.texto,
                cancion_id: gestorDB.mongo.ObjectID(cancion_id)
            }

            // Insertar comentario
            gestorDB.insertarComentario(comentario, function (id) {
                if (id == null) {
                    res.send("Error al insertar comentario ");
                }else {
                    res.send("Agregado comentario id: "+id);
                }
            });
        } else {
            res.send("Error: Usuario no logeado");
        }
    })
}