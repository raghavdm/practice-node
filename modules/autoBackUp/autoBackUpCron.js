let CronJob = require('cron').CronJob
let Cron = require('./autoBackUp')
let cronController = {}
let job = new CronJob('0 0 18 * * *', function() {
  console.log('HERE')
  Cron.autoBackUp()
}, null, true, process.env.TIMEZONE)

cronController.startCron = function(req, res, next) {
  job.start()
  Cron.autoBackUp()
  res.json({ success: true, message: 'Cron started!' })
}

cronController.stopCron = function(req, res, next) {
  job.stop()
  res.json({ success: true, message: 'Cron stopped!' })
}

module.exports = cronController