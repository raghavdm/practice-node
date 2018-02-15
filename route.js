let express = require('express')
let bodyParser = require('body-parser')
let app = express.Router()
app.use('/apidoc', express.static('apidoc'))
app.use('/uploads', express.static('uploads'))
app.use('/api/v1/user', require('./modules/user/userRoute'))
app.use('/*', function(req, res) {
  res.send({
    status: 400,
    message: req.t('NOT_AUTHORIZED')
  })
})
module.exports = app