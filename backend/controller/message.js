'use strict'
const rsa = require('C:/Users/licadena/Documents/CiberseguridadBigData/Ciberseguridad/Prácticas/P1/modulRSA/index.cjs')



function getTest(req, res) {
    res.json({msn: 'Hello World test!'});
}

function getMsg(req, res) {
    return res.status(200).send({ message: 'Hola, tu mensaje será encriptado' });
}

function postMsg(req, res) {
    let mx = req.body.message
    console.log("Mensaje recibido desde el cliente: ", mx)
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: mx });
}

function getPubKey(req, res) {
    let keys = rsa.rsaKeyGeneration
}

module.exports = {
    getTest,
    getMsg,
    postMsg
}