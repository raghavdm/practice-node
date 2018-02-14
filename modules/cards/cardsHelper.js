let utils = require('../../helper/utils')
let cardsUtil = {}

cardsUtil.cardsDetail = (data, selectData) => {
  let cards = {}
  if (utils.empty(selectData)) {
    selectData = ['_id']
  }
  _(selectData).forEach((val) => {
    cards[val] = data[val]
  })
  return cards
}

module.exports = cardsUtil
