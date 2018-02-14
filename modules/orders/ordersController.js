let jwt = require('../../helper/jwt')
let utils = require('../../helper/utils')
let OrdersModel = require('./ordersModel')
let AdminModel = require('../admin/adminModel')
let OrdersTransModel = require('./ordersTransModel')
let FoodTruckModel = require('../foodtruck/foodTruckModel')
let TransactionModel = require('../transactions/transactionModel')
let TransactionLogModel = require('../transactions/transactionLogModel')
let CardModel = require('../cards/cardsModel')
let mongoose = require('mongoose')
let _ = require('lodash')
let momenttz = require('moment-timezone')
let moment = require('moment')
const ALLOCATE = 'allocate'
const TOPUP = 'topup'

let ordersCtr = {
  create: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    let ordersData = {
      userId: authToken.userId,
      rfidCardId: req.body.rfidCardId,
      orderItems: req.body.orderItems
    }
    let orders = new OrdersModel(ordersData)
    let totalPrice = 0
    _(req.body.orderItems).forEach(function(item) {
      totalPrice = totalPrice + (item.productQuantity * item.productPrice)
    })
    FoodTruckModel.findOne({
      _id: authToken.userId
    }).then(function(foodDis) {
      AdminModel.findOne({
        role: 'super'
      }).then(function(adminDis) {
        let happyHrsDis = 0;
        let today = new Date();
        let toDate = new Date(adminDis.happyHours.toDate);
        let fromDate = new Date(adminDis.happyHours.fromDate);
        if (today < toDate && today > fromDate) {
          happyHrsDis = adminDis.happyHrsDis;
        }

        let discountPer = happyHrsDis > 0 ? happyHrsDis : foodDis.discount == 0 ? adminDis.promoDiscount : foodDis.discount
        let discountAmt = 1 - discountPer / 100;
        totalPrice = totalPrice * discountAmt;
        CardModel.findOne({
          rfidCardId: req.body.rfidCardId,
          $or: [{ status: ALLOCATE }, { status: TOPUP }, { status: 'saturity' }]
        }).then(function(cardBalance) {
          let resData = {}
          if (utils.empty(cardBalance)) {
            resData = {
              status: 400,
              messsage: 'Card not found'
            }
            res.json(resData)
          } else {
            if (cardBalance.balance >= totalPrice) {
              let newBalance = Math.round(cardBalance.balance) - Math.round(totalPrice)
              CardModel.findOneAndUpdate({ rfidCardId: req.body.rfidCardId }, { balance: newBalance })
                .then(function(newCard) {
                  orders.save(function(err, newOrder) {
                    if (!err) {
                      let transObj = {
                        truckId: authToken.userId,
                        rfidCardId: req.body.rfidCardId,
                        orderId: newOrder._id,
                        type: 'order',
                        paymentMode: 'debit',
                        payment: 'card',
                        amount: Math.round(totalPrice),
                        createdAt: new Date()
                      }
                      ordersCtr.saveTransaction(transObj)

                      TransactionLogModel.findOneAndUpdate({
                        type: 'saturity',
                        rfidCardId: req.body.rfidCardId
                      }, {
                        amount: newBalance
                      }).exec();

                      let orderTransObj = []
                      _(orders.orderItems).forEach(function(items) {
                        orderTransObj.push({
                          orderId: newOrder._id,
                          userId: authToken.userId,
                          productId: items.productId,
                          productName: items.productName,
                          productQuantity: items.productQuantity,
                        })
                      })

                      OrdersModel.findOneAndUpdate({
                        _id: newOrder._id
                      }, {
                        totalPrice: Math.round(totalPrice),
                        discountPer: discountPer
                      }).exec();

                      OrdersTransModel.insertMany(orderTransObj)
                      let order = []
                      order.push({
                        _id: orders._id,
                        status: orders.status,
                        userId: orders.userId,
                        orderId: orders.orderId,
                        discountPer: discountPer,
                        rfidCardId: orders.rfidCardId,
                        orderItems: orders.orderItems,
                        tokenNumber: orders.tokenNumber,
                        totalPrice: Math.round(totalPrice),
                        createdAt: momenttz.tz(orders.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
                      })
                      resData = {
                        status: 200,
                        orders: order,
                        message: req.t('ORDER_SUCCESS')
                      }
                      res.json(resData)
                    } else {
                      resData = {
                        status: 400,
                        message: req.t('ORDER_NOT_CREATED')
                      }
                      res.json(resData)
                    }
                  })
                })
                .catch(function(err) {
                  console.log(err)
                })
            } else {
              resData = {
                status: 400,
                messsage: 'Insufficient balance'
              }
              res.json(resData)
            }
          }
        })
      })
    }).catch(function(err) {
      console.log(err)
    })
  },

  update: function(req, res) {
    OrdersModel.findOneAndUpdate({
      _id: req.body.orderId
    }, {
      status: 'completed',
      createdAt: Date.now()
    }, function(err) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('ORDER_UPDATE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('ORDER_NOT_UPDATE')
        })
      }
    })
  },

  adminList: function(req, res) {
    OrdersModel.find({
      userId: req.query.userId === '' ? { $ne: null } : req.query.userId,
      createdAt: req.query.from === '' ? { $ne: null } : { $gte: req.query.from, $lte: req.query.to }
    }).populate('userId', 'truckName truckId').skip(req.query.page != 'all' ? +process.env.ADMIN_LIMIT * req.query.page : 0).sort({ createdAt: -1 }).limit(req.query.sorting != '' || req.query.page == 'all' ? +process.env.SORTING_LIMIT : +process.env.ADMIN_LIMIT)

    .then(function(orders) {
      if (orders.length > 0) {
        if (!req.query.sorting) {
          return res.send({
            status: 200,
            orders: orders,
            message: req.t('SUCCESS')
          })
        } else {
          if (req.query.sorting == 'daily') {
            let ordersDaily = [];
            let ordersDate = false;
            let k = 0;
            for (i = 0; i < orders.length; i++) {
              for (j = 0; j < ordersDaily.length; j++) {
                if (ordersDaily[j].createdAt == moment(orders[i].createdAt).format('dddd, MMMM DD YYYY')) {
                  ordersDate = true;
                  ordersDaily[j].totalPrice += orders[i].totalPrice;
                } else if (j == ordersDaily.length - 1 && ordersDate) {
                  ordersDate = false;
                }
              }
              if (ordersDate == false) {
                ordersDaily[k] = {};
                ordersDaily[k].createdAt = moment(orders[i].createdAt).format('dddd, MMMM DD YYYY')
                ordersDaily[k].totalPrice = 0;
                ordersDaily[k].totalPrice += orders[i].totalPrice;
                if (req.query.userId != '') {
                  ordersDaily[k].truckName = orders[i].userId.truckName;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              orders: ordersDaily,
              message: req.t('SUCCESS')
            })
          } else if (req.query.sorting == 'month') {
            let ordersDaily = [];
            let ordersDate = false;
            let k = 0;
            for (i = 0; i < orders.length; i++) {
              for (j = 0; j < ordersDaily.length; j++) {
                if (ordersDaily[j].createdAt == moment(orders[i].createdAt).format('MMMM YYYY')) {
                  ordersDate = true;
                  ordersDaily[j].totalPrice += orders[i].totalPrice;
                } else if (j == ordersDaily.length - 1 && ordersDate) {
                  ordersDate = false;
                }
              }
              if (ordersDate == false) {
                ordersDaily[k] = {};
                ordersDaily[k].createdAt = moment(orders[i].createdAt).format('MMMM YYYY')
                ordersDaily[k].totalPrice = 0;
                ordersDaily[k].totalPrice += orders[i].totalPrice;
                if (req.query.userId != '') {
                  ordersDaily[k].truckName = orders[i].userId.truckName;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              orders: ordersDaily,
              message: req.t('SUCCESS')
            })
          }
        }
      } else {
        return res.send({
          status: 400,
          message: req.t('ORDER_NOT_FOUND')
        })
      }
    })
  },

  list: function(req, res, next) {
    let condition = {}
    let todayDate = new Date()
    let fromDate, toDate, fromTime, toTime, date
    if (utils.empty(req.query.status)) {
      condition = _.extend(condition, { status: { $ne: null } })
    } else {
      condition = _.extend(condition, { status: req.query.status })
    }
    if (utils.empty(req.query.isToday)) {
      if (!utils.empty(req.query.fromDate) && !utils.empty(req.query.toDate)) {
        if (utils.empty(req.query.fromTime) || utils.empty(req.query.toTime)) {
          date = new Date(req.query.fromDate)
          fromDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(0).minutes(0).second(0)).utc())
          date = new Date(req.query.toDate)
          toDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(23).minutes(59).second(59)).utc())
        } else {
          date = new Date(req.query.fromDate)
          fromTime = _.split(req.query.fromTime, ':')
          fromDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(fromTime[0]).minutes(fromTime[1])).utc())
          toTime = _.split(req.query.toTime, ':')
          date = new Date(req.query.toDate)
          toDate = new Date(moment(moment().date(date.getDate()).month(date.getMonth()).year(date.getFullYear()).hours(toTime[0]).minutes(toTime[1])).utc())
        }
        condition = _.extend(condition, { createdAt: { $gte: fromDate, $lte: toDate } })
      } else {
        if (!utils.empty(req.query.fromTime) || !utils.empty(req.query.toTime)) {
          fromTime = _.split(req.query.fromTime, ':')
          fromDate = new Date(moment(moment().date(todayDate.getDate()).hours(fromTime[0]).minutes(fromTime[1])).utc())
          toTime = _.split(req.query.toTime, ':')
          toDate = new Date(moment(moment().date(todayDate.getDate()).hours(toTime[0]).minutes(toTime[1])).utc())
          condition = _.extend(condition, { createdAt: { $gte: fromDate, $lte: toDate } })
        } else {
          fromDate = new Date(moment(moment().date(25).year(2017).month(7).hours(0).minutes(0).second(0)).utc())
          toDate = new Date(moment(moment().date(todayDate.getDate()).hours(23).minutes(59).second(59)).utc())
          condition = _.extend(condition, { createdAt: { $gte: fromDate, $lte: toDate } })
        }
      }
    } else {
      if (utils.empty(req.query.fromTime)) {
        fromDate = new Date(moment(moment().date(todayDate.getDate()).hours(0).minutes(0).second(0)).utc())
      } else {
        fromTime = _.split(req.query.fromTime, ':')
        fromDate = new Date(moment(moment().date(todayDate.getDate()).hours(fromTime[0]).minutes(fromTime[1])).utc())
      }
      if (utils.empty(req.query.toTime)) {
        toDate = new Date(moment(moment().date(todayDate.getDate()).hours(23).minutes(59).second(59)).utc())
      } else {
        toTime = _.split(req.query.toTime, ':')
        toDate = new Date(moment(moment().date(todayDate.getDate()).hours(toTime[0]).minutes(toTime[1])).utc())
      }
      condition = _.extend(condition, { createdAt: { $gte: fromDate, $lte: toDate } })
    }
    if (utils.empty(req.query.userId)) {
      let authToken = jwt.decodeToken(req.headers['x-auth-token'])
      condition = _.extend(condition, { userId: authToken.userId })
    } else {
      condition = _.extend(condition, { userId: req.query.userId })
    }
    OrdersModel.find(condition).populate('userId').skip(+process.env.APP_LIMIT * req.query.page).limit(+process.env.APP_LIMIT).sort({ createdAt: -1 })
      .then(function(orders) {
        if (orders.length > 0) {
          OrdersModel.find(condition).populate('userId').then(function(allOrders) {
            var adminPaymentRatio = allOrders[0].userId.sharing / 100;
            var truckPaymentRatio = 1 - adminPaymentRatio;
            let totalAmount = 0
            _(allOrders).forEach(function(singleOrder) {
              totalAmount += singleOrder.totalPrice
            })
            let resData = []
            _(orders).forEach(function(order) {
              var date
              date = momenttz.tz(order.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
              resData.push({
                _id: order._id,
                orderId: order.orderId,
                rfidCardId: order.rfidCardId,
                status: order.status,
                date: date,
                orderItems: order.orderItems,
                totalPrice: order.totalPrice,
                discountPer: order.discountPer
              })
            })
            res.json({
              status: 200,
              orders: resData,
              message: req.t('SUCCESS'),
              orderTotalPrice: totalAmount,
              orderTruckPrice: Math.ceil(totalAmount * truckPaymentRatio),
              orderAdminPrice: Math.trunc(totalAmount * adminPaymentRatio)
            })
          })
        } else {
          res.json({
            status: 400,
            message: req.t('ORDER_NOT_FOUND')
          })
        }
      })
      .catch(function(err) {
        console.log(err)
      })
  }
}

ordersCtr.orderDetails = function(req, res, next) {
  OrdersModel.findOne({ _id: req.query.orderId }).populate('userId')
    .then(function(order) {
      let newOrder = {
        _id: order._id,
        rfidCardId: order.rfidCardId,
        createdAt: momenttz.tz(order.createdAt, process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss'),
        status: order.status,
        tokenNumber: order.tokenNumber,
        orderItems: order.orderItems
      }
      let resData = {}
      if (order) {
        resData = {
          status: 200,
          message: req.t('SUCCESS'),
          orderTotalPrice: order.totalPrice,
          orders: [newOrder]
        }
      } else {
        resData = {
          status: 400,
          message: 'Order Not Found'
        }
      }
      res.json(resData)
    })

  .catch(function(err) {
    console.log(err)
  })
}

ordersCtr.changeOrder = function(req, res, next) {
  let newPrice = 0
  let oldPrice = 0
  let newOrder
  let authToken = jwt.decodeToken(req.headers['x-auth-token'])
  OrdersModel.findOne({
    _id: req.body.orderId
  }).then(function(order) {
    order.createdAt = new Date()
    newOrder = order
    _(req.body.orderItems).forEach(function(item) {
      newPrice = newPrice + (item.productQuantity * item.productPrice)
    })
    _(order.orderItems).forEach(function(item) {
      oldPrice = oldPrice + (item.productQuantity * item.productPrice)
    })
    newOrder.orderItems = req.body.orderItems
    OrdersTransModel.remove({ orderId: req.body.orderId }).exec()
    let orderTransObj = []
    _(req.body.orderItems).forEach(function(items) {
      orderTransObj.push({
        orderId: newOrder._id,
        userId: authToken.userId,
        productId: items.productId,
        productName: items.productName,
        productQuantity: items.productQuantity
      })
    })
    OrdersTransModel.insertMany(orderTransObj)
    return CardModel.findOne({ rfidCardId: order.rfidCardId })
  }).then(function(card) {
    FoodTruckModel.findOne({
      _id: authToken.userId
    }).then(function(foodDis) {
      AdminModel.findOne({
        role: 'super'
      }).then(function(adminDis) {
        let happyHrsDis = 0;
        let today = new Date();
        let toDate = new Date(adminDis.happyHours.toDate);
        let fromDate = new Date(adminDis.happyHours.fromDate);
        if (today < toDate && today > fromDate) {
          happyHrsDis = adminDis.happyHrsDis;
        }

        let discountPer = happyHrsDis > 0 ? happyHrsDis : foodDis.discount == 0 ? adminDis.promoDiscount : foodDis.discount
        let discountAmt = 1 - discountPer / 100;
        newOrder.totalPrice = newPrice * discountAmt;
        let updData = {}
        if (Math.round(oldPrice) > Math.round(newPrice)) {
          let diff = Math.round(oldPrice) - Math.round(newPrice)
          diff = diff * discountAmt;
          updData = { $inc: { balance: diff } }
          updDatas = { $inc: { amount: diff } }
          CardModel.findOneAndUpdate({ rfidCardId: card.rfidCardId }, updData).exec()

          TransactionLogModel.findOneAndUpdate({
            orderId: newOrder._id,
          }, {
            amount: newPrice * discountAmt
          }).exec()

          newOrder.save()
          let orderUp = {
            _id: newOrder._id,
            userId: newOrder.userId,
            status: newOrder.status,
            discountPer: discountPer,
            orderId: newOrder.orderId,
            orderItems: newOrder.orderItems,
            rfidCardId: newOrder.rfidCardId,
            tokenNumber: newOrder.tokenNumber,
            totalPrice: Math.round(newPrice),
            createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
          }
          res.json({
            status: 200,
            orders: [orderUp],
            message: 'Order updated'
          })
        } else if (Math.round(oldPrice) < Math.round(newPrice)) {
          let diff = Math.round(newPrice) - Math.round(oldPrice)
          diff = diff * discountAmt;
          if (diff > card.balance) {
            res.json({
              status: 400,
              message: 'Insufficient balance'
            })
          } else {
            updData = { $inc: { balance: -diff } }
            updDatas = { $inc: { amount: -diff } }
            CardModel.findOneAndUpdate({ rfidCardId: card.rfidCardId }, updData).exec()

            TransactionLogModel.findOneAndUpdate({
              orderId: newOrder._id,
            }, {
              amount: newPrice * discountAmt
            }).exec()

            newOrder.save()
            let orderUp = {
              _id: newOrder._id,
              userId: newOrder.userId,
              status: newOrder.status,
              orderId: newOrder.orderId,
              discountPer: discountPer,
              orderItems: newOrder.orderItems,
              rfidCardId: newOrder.rfidCardId,
              tokenNumber: newOrder.tokenNumber,
              totalPrice: Math.round(newPrice),
              createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
            }

            res.json({
              status: 200,
              orders: [orderUp],
              message: 'Order updated'
            })
          }
        } else {
          let orderUp = {
            _id: newOrder._id,
            userId: newOrder.userId,
            status: newOrder.status,
            orderId: newOrder.orderId,
            discountPer: discountPer,
            orderItems: newOrder.orderItems,
            rfidCardId: newOrder.rfidCardId,
            tokenNumber: newOrder.tokenNumber,
            totalPrice: Math.round(newPrice),
            createdAt: momenttz.tz(new Date(), process.env.TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
          }

          res.json({
            status: 200,
            orders: [orderUp],
            message: 'Order updated'
          })
        }
      })
    })
  }).then(function(card) {})

  .catch(function(err) {
    console.log(err)
  })
}

ordersCtr.ordersTransaction = function(req, res, next) {
  let condition = {
    'userId': !req.query.userId ? { $ne: null } : mongoose.Types.ObjectId(req.query.userId)
  };

  if (req.query.from) {
    condition["createdAt"] = {
      $lte: new Date(req.query.to),
      $gte: new Date(req.query.from)
    }
  }
  OrdersTransModel.aggregate({
    $lookup: {
      from: 'foodtrucks',
      localField: 'userId',
      foreignField: '_id',
      as: 'userDetail'
    }
  }, {
    $match: condition
  }, {
    $unwind: '$userDetail'
  }, {
    $group: {
      _id: {
        productId: '$productId',
        productName: '$productName'
      },
      userDetail: { $first: '$userDetail' },
      productQuantity: { $sum: { $add: '$productQuantity' } }
    }
  }, {
    $sort: {
      productQuantity: -1
    }
  }).skip(+process.env.ADMIN_LIMIT * req.query.page).limit(+process.env.ADMIN_LIMIT)

  .then(function(items) {
    if (items.length > 0) {
      return res.send({
        status: 200,
        items: items,
        message: req.t('SUCCESS')
      })
    } else {
      return res.send({
        status: 400,
        message: req.t('NO_RECORD_FOUND')
      })
    }
  }).catch(function(err) {
    console.log(err)
  })
}

ordersCtr.truckTransaction = function(req, res, next) {
  let projectCond = [{
    $ne: ['$transDetail', null]
  }, {
    $gte: ['$transDetail.amount', 0]
  }]

  if (req.query.from) {
    projectCond.push({
      $gte: ['$transDetail.createdAt', new Date(req.query.from)]
    }, {
      $lte: ['$transDetail.createdAt', new Date(req.query.to)]
    })
  }

  FoodTruckModel.aggregate({
    $lookup: {
      from: 'transactionLog',
      localField: '_id',
      foreignField: 'truckId',
      as: 'transDetail'
    }
  }, {
    $unwind: {
      path: '$transDetail',
      preserveNullAndEmptyArrays: true
    }
  }, {
    $match: {
      '_id': !req.query.userId ? { $ne: null } : mongoose.Types.ObjectId(req.query.userId)
    }
  }, {
    $project: {
      sharing: 1,
      amount: {
        $cond: [{
            $and: projectCond
          },
          '$transDetail.amount',
          0
        ]
      },
      _id: '$_id',
      truckName: 1
    }
  }, {
    $group: {
      _id: '$_id',
      'sharing': { $first: '$sharing' },
      truckName: { $first: '$truckName' },
      totalAmount: { $sum: { $add: '$amount' } }
    }
  }, {
    $project: {
      _id: 1,
      truckName: 1,
      totalAmount: 1,
      adminAmount: {
        $floor: {
          $multiply: ['$totalAmount', { $divide: ["$sharing", 100] }]
        }
      },
      truckAmount: {
        $ceil: {
          $multiply: ['$totalAmount', { $subtract: [1, { $divide: ["$sharing", 100] }] }]
        }
      }
    }
  }, {
    $sort: {
      truckName: 1
    }
  }).then(function(orderTrans) {
    if (orderTrans.length > 0) {
      return res.send({
        status: 200,
        orderTrans: orderTrans,
        message: req.t('SUCCESS')
      })
    } else {
      return res.send({
        status: 400,
        message: req.t('NO_RECORD_FOUND')
      })
    }
  }).catch(function(err) {
    console.log(err)
  })
}

ordersCtr.saveTransaction = function(transObj) {
  let transaction = new TransactionModel(transObj)
  let transactionLog = new TransactionLogModel(transObj)
  transaction.save()
  transactionLog.save()
}

module.exports = ordersCtr