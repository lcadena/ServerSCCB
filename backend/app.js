var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require("mongoose");
    cors = require("cors");
var router = express.Router();
const Message = require('./models/message')
/* Configuration */
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(router)
app.use(cors({origin: 'http://localhost:4200'}))
app.options('*',cors());
app.use(express.json())
// Localización de los ficheros estÃ¡ticos
//app.use(express.static('/public'));

/** Basic API **/
app.get('/', function(req, res) {
    res.json({msn: 'Hello World!!!'});
});

app.post('/pmessage', (req, res) => {
    let mx = req.body.message
    console.log("Mensaje recibido desde el cliente: ", mx)
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: mx });
});

//GET del mensaje
app.get('/gmessage', (req, res) => {
    return res.status(200).send({ message: 'Hola, tu mensaje será encriptado' });
});

/** Listen on por 3000 and run server **/
app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
});

module.exports = app;

