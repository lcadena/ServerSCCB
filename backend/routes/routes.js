'use strict'

const express = require('express')
const msgCtrl = require('../controller/message')
const api = express.Router()


api.get('/', msgCtrl.getTest)
api.get('/gmessage', msgCtrl.getMsg)
api.get('/pubkey')
api.post('/pmessage', msgCtrl.postMsg)
api.post('/sign')

module.exports = api

