let utils = require('../../helper/utils')
let adminUtil = {}

adminUtil.adminDetail = (data, selectData) => {
  let admin = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    admin[val] = data[val]
  })
  return admin
}

module.exports = adminUtil
