let utils = require('../../helper/utils')
let userUtil = {}

userUtil.userDetail = (data, selectData) => {
  let user = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    user[val] = data[val]
  })
  return user
}

module.exports = userUtil