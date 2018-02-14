let utils = require('../../helper/utils')
let categoryUtil = {}

categoryUtil.categoryDetail = (data, selectData) => {
  let category = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    category[val] = data[val]
  })
  return category
}

module.exports = categoryUtil
