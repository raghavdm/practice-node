const mongoose = require('mongoose')
const Schema = mongoose.Schema

let schema = new Schema({
  name: { type: String },
  userId: { type: String },
  createdAt: { type: Date, default: new Date() }
})

let Category = mongoose.model('Category', schema)

module.exports = Category
