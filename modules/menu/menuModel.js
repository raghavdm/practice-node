const mongoose = require('mongoose')
const Schema = mongoose.Schema

let schema = new Schema({
  name: { type: String },
  image: { type: String },
  price: { type: Number },
  userId: { type: String },
  categoryId: { type: String, ref: 'Category' },
  createdAt: { type: Date, default: new Date() }
})

let Menu = mongoose.model('Menu', schema)

module.exports = Menu
