'use strict'

const express = require('express')
const msgCtrl = require('../controller/message')
const api = express.Router()

/**
 * RSA Endpoints
 */
api.get('/', msgCtrl.getTest)
api.get('/gmessage', msgCtrl.getMsg)
api.get('/pubkey', msgCtrl.getPubKey)
api.post('/pmessage', msgCtrl.postMessage)
api.post('/signmsg', msgCtrl.signMessage)

/**
 * Non-Repudian Endpoints
 */
api.post('/nonr', msgCtrl.nonRepudation)

module.exports = api

