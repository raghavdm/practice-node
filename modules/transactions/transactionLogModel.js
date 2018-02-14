const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const schema = new Schema({
  createdAt: { type: Date },
  counter: { type: String },
  isCredit: { type: Boolean },
  rfidCardId: { type: String },
  reverseText: { type: String },
  amount: { type: Number, default: 0 },
  orderId: { type: ObjectId, ref: 'Orders' },
  cashierId: { type: ObjectId, ref: 'Cashier' },
  truckId: { type: ObjectId, ref: 'FoodTruck' },
  payment: { type: String, enum: ['card', 'cash', 'facevalue', 'paytm'] },
  paymentMode: { type: String, enum: ['credit', 'cash', 'debit', 'facevalue', 'paytm'] },
  type: { type: String, enum: ['allocate', 'topup', 'order', 'refund', 'block', 'facevalue', 'consolidate', 'reversed', 'saturity'] }
}, { collection: 'transactionLog' })

schema.plugin(mongoosePaginate)
const Transaction = mongoose.model('TransactionLog', schema)

module.exports = Transaction
