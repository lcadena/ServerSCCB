var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require("mongoose");
    cors = require("cors");
var router = express.Router();
const rsa = require('C:/Users/licadena/Documents/CiberseguridadBigData/Ciberseguridad/Prácticas/P1/modulRSA/index.cjs')
/* Configuration */
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(router)
//cors comunicación con frontend
app.use(cors({origin: 'http://localhost:4200'}))
app.options('*',cors());
app.use(express.json())
/** Listen on por 3000 and run server **/
app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
});

const bitLenght  = 3072

/** Basic API **/
app.get('/', function(req, res) {
    console.log(rsa.twoModPow(BigInt(7), BigInt(5)).toString())
    console.log(rsa.rsaKeyGeneration(bitLenght))
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

module.exports = app;

