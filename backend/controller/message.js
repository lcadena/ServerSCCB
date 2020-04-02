'use strict'
const rsa = require('rsa')
const bc = require('bigint-conversion')

let keys;

function getTest(req, res) {
    console.log(rsa.twoModPow(BigInt(7), BigInt(5)).toString())
    res.json({msn: 'Hello World test!'});
}

function getMsg(req, res) {
    return res.status(200).send({ message: 'Hola, tu mensaje será encriptado' });
}

function getPubKey(req, res) {
    keys = rsa.rsaKeyGeneration()
    console.log('pubkey: ',keys['publicKey'])
    console.log('privkey: ',keys['privateKey'])
    return res.status(200).send({e: bc.bigintToHex(keys['publicKey']['e']), n: bc.bigintToHex(keys['publicKey']['n'])})
}

function postMessage(req, res) {
    let c = req.body.message
    console.log("Mensaje recibido desde el cliente: ", c);
    // m mensaje desencriptado
    let m = keys['privateKey'].decrypt(bc.hexToBigint(c))
    console.log("Mensaje m: ", m);
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: bc.bigintToHex(m) })
}

function signMessage(req, res) {
    let m = bc.hexToBigint(req.body.message)
    let s = keys['privateKey'].sign(m);
    return res.status(200).send({ message: bc.bigintToHex(s) })
}

module.exports = {
    getTest,
    getMsg,
    postMessage,
    getPubKey,
    signMessage
}