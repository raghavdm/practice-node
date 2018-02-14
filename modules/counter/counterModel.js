const mongoose = require('mongoose')
const Schema = mongoose.Schema

let schema = new Schema({
  name: { type: String },
  counterId: { type: String },
  createdAt: { type: Date, default: new Date() }
})

schema.pre('save', function(next) {
  let currentObject = this
  Counter.find({}, function(error, counters) {
    currentObject.counterId = counters.length + 1
    next()
  })
})

let Counter = mongoose.model('Counter', schema)

module.exports = Counter
