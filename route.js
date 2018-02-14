let express = require('express')
let bodyParser = require('body-parser')
let app = express.Router()
app.use('/apidoc', express.static('apidoc'))
app.use('/uploads', express.static('uploads'))
app.use('/api/v1/menu', require('./modules/menu/menuRoute'))
app.use('/api/v1/admin', require('./modules/admin/adminRoute'))
app.use('/api/v1/cards', require('./modules/cards/cardsRoute'))
app.use('/api/v1/orders', require('./modules/orders/ordersRoute'))
app.use('/api/v1/counter', require('./modules/counter/counterRoute'))
app.use('/api/v1/cashier', require('./modules/cashier/cashierRoute'))
app.use('/api/v1/category', require('./modules/category/categoryRoute'))
app.use('/api/v1/foodtruck', require('./modules/foodtruck/foodTruckRoute'))
app.use('/api/v1/auto-backup', require('./modules/autoBackUp/autoBackUpRoute'))
app.use('/api/v1/truck-sale', require('./modules/autoTruckSale/autoTruckSaleRoute'))
app.use('/api/v1/order-auto-complete', require('./modules/autoOrderComplete/autoOrderCompleteRoute'))
app.use('/*', function(req, res) {
  res.send({
    status: 400,
    message: req.t('NOT_AUTHORIZED')
  })
})
module.exports = app