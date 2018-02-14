global._ = require("lodash")
global.errorUtil = require('../helper/error');
global.config = require('../config/config');
require('../config/database');
global.l10n = require('jm-ez-l10n');
l10n.setTranslationsFile('en', './language/translation.en.json');
let express = require('express');
let bodyParser = require('body-parser');
let app = express();
app.set('port', process.env.PORT);
app.use(l10n.enableL10NExpress);
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true })); // To be tested
app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '1gb', extended: true })); // To be tested
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers,x-auth-token");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(require('../route'));
module.exports = app;
