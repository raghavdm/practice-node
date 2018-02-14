const fs = require('fs');
const _ = require('lodash');
const moment = require('moment')
const momenttz = require('moment-timezone')
const exec = require('child_process').exec;
const google = require('googleapis');
const googleAuth = require('google-auth-library');
const drive = google.drive('v2');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

const auth = new googleAuth();
const oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
fs.readFile(TOKEN_PATH, function(err, token) {
  oauth2Client.credentials = JSON.parse(token);
});

let dbOptions = {
  user: '',
  pass: '',
  host: 'localhost',
  port: 27017,
  database: 'eatit',
  autoBackup: true,
  removeOldBackup: true,
  keepLastDaysBackup: 30,
  autoBackupPath: '' // i.e. /let/database-backup/
};

// ACCESS_KEY_ID = AKIAIYVE7CO5PW67XJ6Q
// SECRET_ACCESS_KEY_ID = e9gHrbb/Yp57e8vUJ0tWF3jfK/AOfEcITQUcYyyg
// REGION = us-east-1
const autoBackUpController = {}

/* return date object */
autoBackUpController.stringToDate = function(dateString) {
  return new Date(dateString);
}

autoBackUpController.empty = function(mixedVar) {
  let key, i, len
  let emptyValues = ['undefined', null, false, 0, '', '0']

  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true
    }
  }
  if (typeof mixedVar === 'object') {
    for (key in mixedVar) {
      return false
    }
    return true
  }

  return false
}

// Auto backup script
autoBackUpController.autoBackUp = function() {
  // check for auto backup is enabled or disabled
  if (dbOptions.autoBackup == true) {
    let date = new Date();
    let beforeDate, oldBackupDir, oldBackupPath;
    currentDate = autoBackUpController.stringToDate(date); // Current date
    let newBackupDir = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    let newBackupPath = dbOptions.autoBackupPath + 'mongodump-' + newBackupDir + '.archive'; // New backup path for current backup process
    // check for remove old backup after keeping # of days given in configuration
    if (dbOptions.removeOldBackup == true) {
      beforeDate = _.clone(currentDate);
      beforeDate.setDate(beforeDate.getDate() - dbOptions.keepLastDaysBackup); // Substract number of days to keep backup and remove old backup
      oldBackupDir = beforeDate.getFullYear() + '-' + (beforeDate.getMonth() + 1) + '-' + beforeDate.getDate();
      oldBackupPath = dbOptions.autoBackupPath + 'mongodump-' + oldBackupDir + '.archive'; // old backup(after keeping # of days)
    }
    let cmd = 'mongodump --host ' + dbOptions.host + ' --port ' + dbOptions.port + ' --db ' + dbOptions.database + ' --archive=' + newBackupPath; // Command for mongodb dump process
    console.log(cmd);

    exec(cmd, function(error, stdout, stderr) {
      if (autoBackUpController.empty(error)) {
        autoBackUpController.uploadFile(newBackupPath);
        // check for remove old backup after keeping # of days given in configuration
        if (dbOptions.removeOldBackup == true) {
          if (fs.existsSync(oldBackupPath)) {
            exec("rm -rf " + oldBackupPath, function(err) {});
          }
        }
      }
    });
  }
}

// Upload File to S3
autoBackUpController.uploadFile = function(files) {
  console.log(TOKEN_PATH);
  fs.readFile(files, function(err, data) {
    drive.files.insert({
      resource: {
        title: files,
        mimeType: 'application/octet-stream'
      },
      media: {
        mimeType: 'application/octet-stream',
        body: data
      },
      auth: oauth2Client
    }, function(err, response) {
      console.log('inserted:', response);
      console.log('error:', err);
      // console.log('error:', err, 'inserted:', response.id);
    });
  });
}

module.exports = autoBackUpController