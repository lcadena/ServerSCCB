'use strict'
const rsa = require('rsa')
const bc = require('bigint-conversion')
const sha = require('object-sha')
const crypto = require('crypto')

let keys;
let pubKeyA;

function getTest(req, res) {
    console.log(rsa.twoModPow(BigInt(7), BigInt(5)).toString())
    res.json({msn: 'Hello World test!'});
}

/**
 * RSA functions
 */
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

/**
 * Non Repudation functions with AES-CBC
 */
function nonRepudation(req, res) {
    const msgCrypto = req.body.body.msg
    console.log('Mensaje del body: ', msgCrypto)
    // Proof of origin
    Po = req.body.signature
    console.log('Proof of origin: ', Po)
    // Extraemos las claves de A
    pubKeyA = new rsa.PublicKey(bc.hexToBigint(req.body.publicKey.e), bc.hexToBigint(req.body.publicKey.n))
    // proof (firma digital) asociada al tipo de mensaje
    const digestProof = bc.bigintToHex(pubKeyA.verify(bc.hexToBigint(req.body.signature)))
    const digestBody = sha.digest(req.body.body)
    // Generar timestamp de B
    const timestampB = Date.now()
    if(digestProof === digestBody) {
        // Mensaje del body 
        const m = bc.hexToBigint(req.body.body.msg)
        // Creamos el body del mensaje 2
        const body = {
            type: '2',
            src: 'A',
            dst: 'B',
            msg: bc.bigintToText(m),
            timestamp: timestampB
        };
        const digest = sha.digest(body, 'SHA-256')
        const digestH = bc.hexToBigint(digest)
        const signature = keys['privateKey'].sign(digestH)

        return res.status(200).send({
            body: body,
            signature: bc.bigintToHex(signature)
        })
    }
    else { console.log('Error en el if del nonRepudion') }
}



module.exports = {
    getTest,
    getMsg,
    postMessage,
    getPubKey,
    signMessage,
    nonRepudation
}