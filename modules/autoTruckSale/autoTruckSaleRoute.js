const express = require('express')
const truckSaleRouter = express.Router()
const autoTruckSaleCron = require('./autoTruckSaleCron')

truckSaleRouter.get('/start',
  autoTruckSaleCron.startCron
)
truckSaleRouter.get('/stop',
  autoTruckSaleCron.stopCron
)
module.exports = truckSaleRouter