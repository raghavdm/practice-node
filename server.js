let http = require('http');
require("dotenv").config();
//for cron
let app = require('./config/app');
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
