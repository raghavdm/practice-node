let utils = require('../../helper/utils')
let counterUtil = {}

counterUtil.counterDetail = (data, selectData) => {
  let counter = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    counter[val] = data[val]
  })
  return counter
}

module.exports = counterUtil
