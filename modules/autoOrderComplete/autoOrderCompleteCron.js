let moment = require('moment')
let CronJob = require('cron').CronJob
let Cron = require('./autoOrderComplete')
let orderCompleteController = {}
let orderjob = new CronJob('0 */30 * * * *', function() {
  console.log('HERES')
  console.log(moment());
  Cron.autoComplete()
}, null, true, process.env.TIMEZONE)

orderCompleteController.startCron = function(req, res, next) {
  orderjob.start()
  res.json({ success: true, message: 'Cron started!' })
}

orderCompleteController.stopCron = function(req, res, next) {
  orderjob.stop()
  res.json({ success: true, message: 'Cron stopped!' })
}

module.exports = orderCompleteController
