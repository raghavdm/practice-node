const fs = require('fs');
const _ = require('lodash')
const moment = require('moment')
const momenttz = require('moment-timezone')
const OrdersModel = require('../orders/ordersModel')
const json2csv = require('json2csv');
const nodemailer = require('nodemailer');
const fields = ['TruckName', 'TotalPrice'];

const autoTruckSaleController = {}

autoTruckSaleController.empty = function(mixedVar) {
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

autoTruckSaleController.autoMail = function(res) {
  let date = new Date();
  let toDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(6).minutes(0).second(0)).utc())
  let fromDate = new Date(moment(moment().date(date.getDate() - 1).month(date.getMonth()).year(date.getFullYear()).hours(18).minutes(0).second(0)).utc())
  OrdersModel.find({
    status: 'completed',
    createdAt: {
      $gte: fromDate,
      $lte: toDate
    }
  }).populate('userId', 'truckName truckId').then(function(orders) {

    if (orders) {
      let ordersDaily = [];
      let ordersDate = false;
      let k = 0;
      for (i = 0; i < orders.length; i++) {
        let obj = ordersDaily.filter(obj => obj.userId.toString() == orders[i].userId._id.toString());
        if (!autoTruckSaleController.empty(obj)) {
          obj[0].TotalPrice += +orders[i].totalPrice;
        } else {
          ordersDaily[k] = {};
          ordersDaily[k].TotalPrice = 0;
          ordersDaily[k].userId = orders[i].userId._id
          ordersDaily[k].TotalPrice += +orders[i].totalPrice;
          ordersDaily[k].TruckName = orders[i].userId.truckName;
          k++;
        }
      }

      let csv = json2csv({ data: ordersDaily, fields: fields });
      fs.writeFile('file.csv', csv, function(err) {
        if (err) console.log(err);
        console.log('file saved');
      });

      let selfSignedConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASS
        }
      };
      smtpTransport = nodemailer.createTransport(selfSignedConfig);
      smtpTransport.sendMail({
        from: process.env.SMTP_MAIL,
        to: process.env.SMTP_MAIL,
        subject: 'Daily Truck Sale Report',
        attachments: [{
          path: './file.csv'
        }],
        html: 'Please find the attached truck sale report for ' + moment().subtract("1", "days").format('dddd, MMMM DD YYYY')
      }, function(error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log('mail sent....');
          error = "";
        }
      });
    }
  }).catch(function(err) {
    console.log(err)
  })
}

module.exports = autoTruckSaleController