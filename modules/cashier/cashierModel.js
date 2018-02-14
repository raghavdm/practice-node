const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

let schema = new Schema({
  email: { type: String },
  password: { type: String },
  cashierName: { type: String },
  cardsAllocate: { type: Number },
  login: { type: Boolean, default: false },
  deviceToken: { type: String, default: '' },
  role: { type: String, default: 'Cashier' },
  status: { type: String, default: 'Active' },
  counter: { type: ObjectId, ref: 'Counter' },
  createdAt: { type: Date, default: new Date() },
  dailyReports: { type: Boolean, default: false }
})

const Cashier = mongoose.model('Cashier', schema)

module.exports = Cashier
