module.exports = function(app, swig, gestorDB) {

    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });
};