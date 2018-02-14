const _ = require('lodash')
const moment = require('moment')
const momenttz = require('moment-timezone')
const OrdersModel = require('../orders/ordersModel')

const autoOrderCompleteController = {}

autoOrderCompleteController.empty = function(mixedVar) {
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

autoOrderCompleteController.autoComplete = function() {
  OrdersModel.find({ status: { $ne: 'completed' } }).then(function(orders) {
    if (orders) {
      let date
      let today = moment();
      let orderIds = []
      _(orders).forEach(function(order) {
        date = moment(order.createdAt)
        if (today.diff(date, 'minutes') > 30) {
          orderIds.push(order._id)
        }
      })
      if (autoOrderCompleteController.empty(orderIds)) {
        return true
      } else {
        return OrdersModel.updateMany({ _id: { $in: orderIds } }, { status: 'completed' })
      }
    }
  }).catch(function(err) {
    console.log(err)
  })
}

module.exports = autoOrderCompleteController