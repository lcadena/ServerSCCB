'use strict'
const rsa = require('rsa')
const bc = require('bigint-conversion')

function getTest(req, res) {
    console.log(rsa.twoModPow(BigInt(7), BigInt(5)).toString())
    res.json({msn: 'Hello World test!'});
}

function getMsg(req, res) {
    return res.status(200).send({ message: 'Hola, tu mensaje será encriptado' });
}

function postMsg(req, res) {
    let mx = req.body.message
    console.log("Mensaje recibido desde el cliente: ", mx);
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: mx });
}

function getPubKey(req, res) {
    let keys = rsa.rsaKeyGeneration()
    console.log(keys['publicKey'])
    res.status(200).send({e: bc.bigintToHex(keys['publicKey']['e']), n: bc.bigintToHex(keys['publicKey']['n'])})
}

module.exports = {
    getTest,
    getMsg,
    postMsg,
    getPubKey
}