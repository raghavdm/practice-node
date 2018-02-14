const mongoose = require('mongoose')
const Schema = mongoose.Schema

let cashierAllocateschema = new Schema({
  createdAt: { type: Date },
  session: { type: String, default: '' },
  cardsReturn: { type: Number, default: 0 },
  cashAllocate: { type: Number, default: 0 },
  cardsAllocate: { type: Number, default: 0 },
  cashierId: { type: String, ref: 'Cashier' }
})

const CashierAllocate = mongoose.model('CashierAllocate', cashierAllocateschema)

module.exports = CashierAllocate
