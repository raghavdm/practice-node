const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

let schema = new Schema({
  userId: { type: String, ref: 'FoodTruck' },
  orderId: { type: Number, default: 0 },
  orderItems: [{
    productId: { type: String, ref: 'Menu' },
    productName: { type: String },
    productPrice: { type: Number },
    productQuantity: { type: Number }
  }],
  rfidCardId: { type: String },
  totalPrice: { type: Number, default: 0 },
  discountPer: { type: Number, default: 0 },
  tokenNumber: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

schema.pre('save', function(next) {
  let currentObject = this
  if (currentObject.orderId == 0) {
    Orders.find({ createdAt: { $gte: new Date(moment(new Date()).format('YYYY-MM-DD')) } }, function(error, counter) {
      currentObject.tokenNumber = counter.length + 1
      Orders.find({}, function(error, counters) {
        currentObject.orderId = counters.length + 1
        next()
      })
    })
  } else {
    next()
  }
})

let Orders = mongoose.model('Orders', schema)

module.exports = Orders
