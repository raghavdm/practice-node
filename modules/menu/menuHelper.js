let utils = require('../../helper/utils')
let menuUtil = {}

menuUtil.menuDetail = (data, selectData) => {
  let menu = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    menu[val] = data[val]
  })
  return menu
}

module.exports = menuUtil
