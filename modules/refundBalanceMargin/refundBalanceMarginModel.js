/**
 *  This modal is created to manage margin of return balance
 *  at the end of the day between cashier and food truck
 *  e.g. Card has 145 rupees balance and cashier has return
 *  140 or 150 rupees so remaining balance or difference who will get?
 *  This scenario will be managed in next phase
*/

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const schema = new Schema({
  cashierId: { type: ObjectId, ref: 'Cashier' },
  rfidCardId: { type: String },
  refundAmount: { type: Number },
  balance: { type: Number },
  counter: { type: Number },
  createdAt: { type: Date }
}, { collection: 'refundBalanceMargin' })

schema.plugin(mongoosePaginate)
const RefundBalanceMargin = mongoose.model('RefundBalanceMargin', schema)

module.exports = RefundBalanceMargin
