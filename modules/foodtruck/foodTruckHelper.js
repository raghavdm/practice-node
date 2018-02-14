let utils = require('../../helper/utils')
let foodTruckUtil = {}

foodTruckUtil.foodTruckDetail = (data, selectData) => {
  let foodTruck = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    foodTruck[val] = data[val]
  })
  return foodTruck
}

module.exports = foodTruckUtil
