const mongoose = require('mongoose')
const Schema = mongoose.Schema
let cardsCons

let schema = new Schema({
  rfidCardId: { type: String },
  rfidCardIdNew: { type: String },
  createdAt: { type: Date, default: new Date() }
})

cardsCons = mongoose.model('CardsCons', schema)

module.exports = cardsCons
