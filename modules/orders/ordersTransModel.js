const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

let schema = new Schema({
  userId: { type: ObjectId, ref: 'FoodTruck' },
  orderId: { type: String, ref: 'Order' },
  productId: { type: String },
  productName: { type: String },
  productQuantity: { type: Number },
  createdAt: { type: Date, default: Date.now }
})

let OrdersTrans = mongoose.model('OrdersTrans', schema)

module.exports = OrdersTrans
