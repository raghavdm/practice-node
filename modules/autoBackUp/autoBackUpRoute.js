const express = require('express')
const router = express.Router()
const autoBackUpCron = require('./autoBackUpCron')

router.get('/start',
  autoBackUpCron.startCron
)
router.get('/stop',
  autoBackUpCron.stopCron
)
module.exports = router
