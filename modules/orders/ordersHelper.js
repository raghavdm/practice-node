let utils = require('../../helper/utils')
let ordersUtil = {}

ordersUtil.ordersDetail = (data, selectData) => {
  let orders = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    orders[val] = data[val]
  })
  return orders
}

module.exports = ordersUtil
