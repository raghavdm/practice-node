const express = require('express')
const orderCompleteRouter = express.Router()
const autoOrderCompleteCron = require('./autoOrderCompleteCron')

orderCompleteRouter.get('/start',
  autoOrderCompleteCron.startCron
)
orderCompleteRouter.get('/stop',
  autoOrderCompleteCron.stopCron
)
module.exports = orderCompleteRouter
