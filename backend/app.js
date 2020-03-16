var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require("mongoose");
    cors = require("cors");
var router = express.Router();
const Message = require('./models/message')
/* Configuration */
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(router);
app.use(cors({origin: 'http://localhost:4200'}))
app.use(express.json())
// Localización de los ficheros estÃ¡ticos
//app.use(express.static('/public'));

/** Basic API **/
app.get('/', function(req, res) {
    res.json({msn: 'Hello World!!!'});
});
//POST del mensaje
// app.post('/message', (req, res) => {
//     let msn = req.body.message
//     console.log("Mensaje recibido desde el cliente: ", msn)
//     return res.status(200).send('Saludos desde express, tu mensaje ha sido ' + msn);
// });

app.post('/message/:msn', (req, res) => {
    const mx = {
        message: req.params.msn
    }
    console.log("Mensaje -----: ", mx.message)
    return res.json(mx)
    //return res.status(200).send('Saludos desde express, mensaje = ' + msn);
});

//GET del mensaje
app.get('/message/:msn', (req, res) => {
    const mx2 = {
        message: req.params.msn
    }
    console.log("Mensaje: ", mx2.message)
    return res.json(mx2);
});

/** Listen on por 3000 and run server **/
app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
});

/** Load an HTML of the single app with angular 
app.all('*', (req, res) => {
    //res.sendFile('../index.html')
    //res.sendFile(path.join(__dirname, './frontend', 'index.html'));
    res.sendFile('index.html', { root: './public' })
});**/

