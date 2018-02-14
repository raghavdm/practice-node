const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

let cashTrackschema = new Schema({
  cashierId: { type: String },
  counter: { type: ObjectId, ref: 'Counter' },
  createdAt: { type: Date, default: new Date() }
})

const Cashier = mongoose.model('CashierTrack', cashTrackschema)

module.exports = Cashier
