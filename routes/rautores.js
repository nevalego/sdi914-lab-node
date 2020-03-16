module.exports = function (app, swig) {

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {});
        res.send(respuesta);
    });

    app.post('/autores', function (req, res) {

        var param;
        if ( typeof(req.body.nombre) != "undefined"
            && typeof(req.body.grupo) != "undefined"
            && typeof(req.body.rol) != "undefined"
        ) {
            res.send("Autor agregado:" + req.body.nombre + "<br>"
                + " grupo : " + req.body.grupo + "<br>"
                + " rol: " + req.body.rol);
        } else {
            if(typeof(req.body.nombre) == "undefined" ){
                param = req.body.nombre;
                res.send(param+' no enviado a la petición.');
            }if(typeof(req.body.grupo) == "undefined" ){
                param = req.body.grupo;
                res.send(param+' no enviado a la petición.');
            }if(typeof(req.body.rol) == "undefined" ){
                param = req.body.rol;
                res.send(param+' no enviado a la petición.');
            }
        }
    });

    app.get('/autores/:id', function (req, res) {
        let respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    });

    app.get("/autores", function (req, res) {
        var autores = [{
            "nombre": "Freddie Mercury",
            "grupo": "Queen",
            "rol": "Cantante"
        }, {
            "nombre": "Nick Mason",
            "grupo": "Pink Floyd",
            "rol": "Batería"
        }, {
            "nombre": "Jamie Cook",
            "grupo": "Artic Monkeys",
            "rol": "Guitarrista"
        }];

        var respuesta = swig.renderFile('views/autores.html', {
            vendedor: 'Tienda de canciones',
            autores: autores
        });
        res.send(respuesta);
    });


    app.get("/autores/:*", function (req, res) {
        res.redirect("autores/");
    });


}