const mongoose = require('mongoose')
const Schema = mongoose.Schema
let Cards

let schema = new Schema({
  userId: { type: String },
  balance: { type: Number },
  counter: { type: String },
  validity: { type: Number },
  faceValue: { type: String },
  rfidCardId: { type: String },
  createdAt: { type: Date, default: new Date() },
  paymentMode: { type: String, enum: ['credit', 'cash', 'facevalue', 'paytm'] },
  status: { type: String, enum: ['allocate', 'topup', 'refund', 'block', 'expired', 'consolidate', 'saturity'] }
})

Cards = mongoose.model('Cards', schema)

module.exports = Cards
