const mongoose = require('mongoose')
const Schema = mongoose.Schema

let schema = new Schema({
  email: { type: String },
  phone: { type: String },
  truckId: { type: Number },
  altPhone: { type: String },
  password: { type: String },
  ownerName: { type: String },
  truckName: { type: String },
  sharing: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  role: { type: String, default: 'Food Truck' },
  createdAt: { type: Date, default: new Date() }
})

schema.pre('save', function(next) {
  let currentObject = this
  foodTruck.find({}, function(error, counters) {
    currentObject.truckId = counters.length + 1
    next()
  })
})

const foodTruck = mongoose.model('FoodTruck', schema)

module.exports = foodTruck
