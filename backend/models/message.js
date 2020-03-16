const mongoose = require('mongoose')
const Schema = mongoose.Schema

//crear el esquema de mensaje
const MessageSchema = new Schema({
  message:String  
})
