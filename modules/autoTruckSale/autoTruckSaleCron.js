let moment = require('moment')
let CronJob = require('cron').CronJob
let Cron = require('./autoTruckSale')
let truckSaleController = {}
let truckSaleJob = new CronJob('0 0 9 * * *', function() {
  console.log('HERES')
  Cron.autoMail()
}, null, true, process.env.TIMEZONE)

truckSaleController.startCron = function(req, res, next) {
  truckSaleJob.start()
  Cron.autoMail()
  res.json({ success: true, message: 'Cron started!' })
}

truckSaleController.stopCron = function(req, res, next) {
  truckSaleJob.stop()
  res.json({ success: true, message: 'Cron stopped!' })
}

module.exports = truckSaleController