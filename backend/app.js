const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const api_msg = require('./routes/routes')
const router = express.Router();

/* Configuration */
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(router)
app.use(cors({origin: 'http://localhost:4200'}, {origin: 'http://localhost:3002'}))
app.options('*',cors())
app.use(express.json())
app.use('', api_msg)
/** Listen on por 3000 and run server **/
app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
});

const bitLenght  = 3072
module.exports = app;

