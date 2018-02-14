let utils = require('../../helper/utils')
let cashierUtil = {}

cashierUtil.cashierDetail = (data, selectData) => {
  let cashier = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    cashier[val] = data[val]
  })
  return cashier
}

module.exports = cashierUtil
