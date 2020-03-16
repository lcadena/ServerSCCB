var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override");
    mongoose = require("mongoose");
    cors = require("cors");
var router = express.Router();
const Message = require('./models/message.js')
/* Configuration */
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(router);
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin","http://localhost:4200");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    }
    next()
})

app.use(cors())
// Localización de los ficheros estÃ¡ticos
app.use(express.static('/public'));

/** Basic API **/
app.get('/', function(req, res) {
    res.send("Hello World :) !");
});
//POST del mensaje
// app.post('/message', (req, res) => {
//     let msn = req.body.message
//     console.log("Mensaje recibido desde el cliente: ", msn)
//     return res.status(200).send('Saludos desde express, tu mensaje ha sido ' + msn);
// });

app.post('/message/:msn', (req, res) => {
    let msn = req.params.msn
    console.log("Mensaje -----: ", msn)
    return res.status(200).send('Saludos desde express, mensaje = ' + msn);
});

//GET del mensaje
app.get('/message/:msn', (req, res) => {
    let msn1 = req.params.msn
    console.log("Mensaje: ", msn1)
    return res.status(200).send(msn1);
});

app.get('/testing', (req, res) => {
    return res.status(200).send('prueba andrea');
});

/** Load an HTML of the single app with angular **/
app.all('*', (req, res) => {
    //res.sendFile('../index.html')
    //res.sendFile(path.join(__dirname, './frontend', 'index.html'));
    res.sendFile('index.html', { root: './public' })
});

/** Listen on por 3000 and run server **/
app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
});