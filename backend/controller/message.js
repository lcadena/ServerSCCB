'use strict'
const rsa = require('rsa')
const bc = require('bigint-conversion')
const sha = require('object-sha')
const crypto = require('crypto')
const paillierBigint = require('paillier-bigint')
const shamir = require('shamirs-secret-sharing')
const io = require('socket.io')(3003, {path: ''})

let keys; // keypair of B
let pubKeyA;
let pubKeyTTP
let Po;
let iv;
let keyAES;
let pkp;
let msgCrypto;
let pubKeyPallier;
let privKeyPallier;
let keysPallier;
let recoveredH;

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

async function getPubKey(req, res) {
    keys = rsa.rsaKeyGeneration()
    console.log('pubkey: ',keys['publicKey'])
    console.log('privkey: ',keys['privateKey'])
    return res.status(200).send(
        {e: bc.bigintToHex(keys['publicKey']['e']), 
         n: bc.bigintToHex(keys['publicKey']['n'])})
}

async function postMessage(req, res) {
    let c = req.body.message
    console.log("Mensaje encriptado recibido desde el cliente: ", c);
    // m mensaje desencriptado
    let m = keys['privateKey'].decrypt(bc.hexToBigint(c))
    console.log('Mensaje desencriptado en el servidor', {
        msg: m
    })
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: bc.bigintToHex(m) })
}

async function signMessage(req, res) {
    // mensaje que viene del cliente que va a ser firmado
    let m = bc.hexToBigint(req.body.message)
    // firma del mensaje con la Kpriv del servidor
    let s = keys['privateKey'].sign(m);
    console.log('Sign message en el server', {
        sign: bc.bigintToHex(s)
    })
    return res.status(200).send({ message: bc.bigintToHex(s) })
}

/**
 * Non Repudation functions with AES-CBC
 */
async function nonRepudation(req, res) {
    // console.log('req que viene de A: ', req.body)
    msgCrypto = req.body.body.msg
    console.log('Mensaje encriptado con AES-CBC en B: ', msgCrypto)
    // Proof of origin
    Po = req.body.signature
    console.log('Proof origen en B: ', {
        po: Po
    })
    // Extraemos las claves de A
    pubKeyA = new rsa.PublicKey(bc.hexToBigint(req.body.publicKey.e), bc.hexToBigint(req.body.publicKey.n))
    // console.log('pubKeyA en back: ', pubKeyA)
    // proof (firma digital) asociada al tipo de mensaje
    const digestProof = bc.bigintToHex(pubKeyA.verify(bc.hexToBigint(req.body.signature)))
    // console.log('digestProof back: ', digestProof)
    // console.log(sha.hashable(req.body.body))
    const digestBody = await sha.digest(req.body.body)
    // console.log('digestBody back: ', digestBody)
    // Generar timestamp de B y verificación
    const timestampB = Date.now()
    const tsnowB = Date.now()
    console.log('tsnowB: ', tsnowB)
    const tsresponseA = req.body.body.timestamp
    console.log('tsresponseA en B: ', tsresponseA)
    //&& (tsresponseB > (tsnowA - 180000) && tsresponseB < (tsnowA + 180000))
    if ((digestBody === digestProof) && (tsresponseA > (tsnowB - 180000) && tsresponseA < (tsnowB + 180000))) {
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
        const digest = await sha.digest(body, 'SHA-256')
        const digestH = bc.hexToBigint(digest)
        const signature = keys['privateKey'].sign(digestH)

        return res.status(200).send({
            body: body,
            signature: bc.bigintToHex(signature)
        })
    }
    else { console.log('Error en el if del nonRepudion') }
}

async function decryptMessage(req, res) {
    console.log('req del server', req.body)
    pubKeyTTP = new rsa.PublicKey(bc.hexToBigint(req.body.pubkey.e), bc.hexToBigint(req.body.pubkey.n))
    const digestProofI = await bc.bigintToHex(pubKeyTTP.verify(bc.hexToBigint(req.body.signature)))
    console.log('digestProofI: ', digestProofI)
    const digestBodyI = await sha.digest(req.body.body)
    console.log('digestBodyI: ', digestBodyI)
    if(digestBodyI === digestProofI) {
        // proof of publication
        pkp = req.body.signature
        console.log('pkp: ', pkp)
        keyAES = req.body.body.k
        console.log('keyAES: ', keyAES)
        iv = req.body.body.iv
        console.log('iv: ', iv)
        const decryptMSG = await decryptM(keyAES, iv)
        console.log('decryptedmessage: ', decryptMSG)

        return res.status(200).send({
            po: Po,
            pkp: pkp,
            key: keyAES,
            message: decryptMSG
        })
    } else {
        return res.status(500).send({msg: 'Error a desencriptar el mensaje'})
    }
}

async function decryptM(k, iv) {
    console.log('Mensage que llega a decrypt: ', msgCrypto)
    const encrypted = Buffer.from(msgCrypto, 'hex')
    console.log('encrypted: ', encrypted)
    const decipher = crypto.createDecipheriv('aes-256-cbc', bc.hexToBuf(k), bc.hexToBuf(iv))
    console.log('decipher: ', decipher)
    const decrypted = decipher.update(encrypted)
    console.log('decrypted: ', decrypted)
    //Buffer.concat([decrypted, decipher.final()])
    const decryptedI = decrypted + decipher.final()
    console.log('decryptedI: ', decryptedI)
    return decryptedI.toString()
}

/**
 * Homomorphism
 */

async function getPKeyPallier(req, res) {
    keysPallier = await paillierBigint.generateRandomKeys(3072)
    console.log('pubKey pallier: ', keysPallier['publicKey'])
    console.log('privKey pallier: ', keysPallier['privateKey'])
    return res.status(200).send({
        n: bc.bigintToHex(keysPallier.publicKey.n),
        g: bc.bigintToHex(keysPallier.publicKey.g)
    })
}

async function homomorphicSum(req, res) {
    console.log('body que viene del front: ', req.body.message)
    const encryptSum = bc.hexToBigint(req.body.message)
    console.log('encryptSum back: ', encryptSum)
    const sum = keysPallier.privateKey.decrypt(encryptSum)
    console.log('suma desencriptada back: ', sum)
    return res.status(200).send({message: bc.bigintToHex(sum)})
}

async function homomorphicMultiply(req, res) {
    console.log('body que viene del front: ', req.body.message)
    const encryptMul = bc.hexToBigint(req.body.message)
    console.log('encryptMul back: ', encryptMul)
    const mul = keysPallier.privateKey.decrypt(encryptMul)
    console.log('multiplicación desencriptada back: ', mul)
    return res.status(200).send({message: bc.bigintToHex(mul)})
}

/**
 * Shamir's secret sharing
 */
async function getslicesShamir(req, res) {
//     const splits = shamir.split(bc.bigintToBuf(keys.privateKey.d), {shares: 10, threshold: 4})
//     console.log('split back: ', splits)
// /**
//      * @typedef {Array<String>} slices
//      */crypto.randomBytes(64)

//     let slices = [];
//     splits.forEach(split => slices.push(bc.bufToHex(split)))
//     return res.status(200).send({slices})
    // const secret = bc.bigintToBuf(keys.privateKey.d)
    // console.log('secret', secret)
    // console.log('secret buftoH', bc.bufToHex(secret))
    // slices = secretInit(secret)
    // console.log('slices: ', slices)
    // console.log({slices: slices})

    // return res.status(200).send({message: 'Generando slices para el secreto compartido'})
}

async function recoverMsgShamir(req, res) {
    const c = req.body.message
    console.log("Mensaje recibido desde el cliente: ", c);
    console.log('private key B: ', keys['privateKey'])
    const secret = bc.bigintToBuf(keys.privateKey.d)
    console.log('secret', secret)
    console.log('secret buftoH', bc.bufToHex(secret))
    const slices = secretInit(secret)
    console.log('slices: ', slices)
    console.log({slices: slices})
    // recover the key 
    const recovered = shamir.combine(await slices)
    console.log('recovered: ', recovered)
    console.log('recovered to string: ', recovered.toString())
    console.log('recovered buf to hex: ', bc.bufToHex(recovered))
    console.log('recovered buf to bigint: ', bc.bufToBigint(recovered))
    //console.log('recovered hex to bigint: ', bc.hexToBigint(recovered))
    console.log('private key B: ', keys['privateKey'])
    // m mensaje desencriptado
    recoveredH = bc.bufToBigint(recovered)
    console.log('recoveredH: ', recoveredH)
    //let m = recoveredH.decrypt(bc.hexToBigint(c))
    const newKey = new rsa.PrivateKey(recoveredH, keys['publicKey'])
    console.log('newKey: ', newKey)
    let mm = newKey.decrypt(bc.hexToBigint(c))
    console.log("Mensaje mm: ", mm);
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: bc.bigintToHex(mm) })
}

/**
 * @typedef {Uint8Array} secret
 */

async function secretInit(secret){
    console.log('secret: ', secret)
    const buffers = shamir.split(secret, {shares: 4, threshold: 2})
    console.log('buffers: ', buffers)
    /**
     * @typedef {Array<string>} slices
     */
    const slices = []
    buffers.forEach(buffer => slices.push(bc.bufToHex(buffer)))
    return slices
}


module.exports = {
    getTest,
    getMsg,
    postMessage,
    getPubKey,
    signMessage,
    nonRepudation,
    getPKeyPallier,
    homomorphicSum,
    homomorphicMultiply,
    getslicesShamir,
    decryptMessage,
    recoverMsgShamir
}