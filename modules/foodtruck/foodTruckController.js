let md5 = require('md5')
let _ = require('lodash')
let jwt = require('../../helper/jwt')
let utils = require('../../helper/utils')
let foodTruckUtil = require('./foodTruckHelper')
let foodTruckModel = require('./foodTruckModel')

let foodTruckCtr = {
  login: function(req, res) {
    foodTruckModel.findOne({
      email: req.body.email.toLowerCase()
    }).then(function(foodTruck) {
      if (!foodTruck) {
        return res.send({
          status: 400,
          message: req.t('NOT_VALID_FOOD_TRACK')
        })
      } else if (md5(req.body.password) !== foodTruck.password) {
        return res.send({
          status: 400,
          message: req.t('PASSWORD_NOT_FOUND')
        })
      } else {
        let token = jwt.createSecretToken({
          'userId': foodTruck._id,
          'email': foodTruck.email
        })
        let foodTruckData = {
          _id: foodTruck._id,
          type: foodTruck.type,
          email: foodTruck.email,
          phone: foodTruck.phone,
          status: foodTruck.status,
          altPhone: foodTruck.altPhone,
          ownerName: foodTruck.ownerName,
          truckName: foodTruck.truckName
        }
        foodTruckData.secretToken = token
        if (foodTruckData.status == 'Block') {
          return res.send({
            status: 400,
            message: req.t('USER_BLOCK')
          })
        } else {
          return res.send({
            status: 200,
            foodTruck: foodTruckData,
            message: req.t('LOGIN_SUCCESS')
          })
        }
      }
    })
  },

  create: function(req, res) {
    foodTruckModel.findOne({
      email: req.body.email.toLowerCase()
    }).then(function(result) {
      if (result) {
        return res.send({
          status: 400,
          message: req.t('FOOD_TRUCK_EMAIL_REGISTERED')
        })
      } else {
        let foodTruckData = {
          phone: req.body.phone,
          altPhone: req.body.altPhone,
          ownerName: req.body.ownerName,
          truckName: req.body.truckName,
          password: md5(req.body.password),
          email: req.body.email.toLowerCase(),
          sharing: !req.body.sharing ? 0 : req.body.sharing,
          discount: !req.body.discount ? 0 : req.body.discount,
        }
        let foodTruck = new foodTruckModel(foodTruckData)
        foodTruck.save(function(err) {
          return res.send({
            status: 200,
            message: req.t('FOOD_TRUCK_CREATE')
          })
        })
      }
    })
  },

  edit: function(req, res) {
    console.log(req.body.discount);
    foodTruckModel.findOne({
      _id: { $nin: req.body.userId },
      email: req.body.email.toLowerCase()
    }).then(function(result) {
      if (result) {
        return res.send({
          status: 400,
          message: req.t('FOOD_TRUCK_EMAIL_REGISTERED')
        })
      } else {
        let updateObj = {
          phone: req.body.phone,
          altPhone: req.body.altPhone,
          ownerName: req.body.ownerName,
          truckName: req.body.truckName,
          email: req.body.email.toLowerCase(),
          sharing: !req.body.sharing ? 0 : req.body.sharing,
          discount: !req.body.discount ? 0 : req.body.discount,
        }
        if (!utils.empty(req.body.password)) {
          updateObj = _.extend(updateObj, { password: md5(req.body.password) })
        }
        foodTruckModel.findOneAndUpdate({
          _id: req.body.userId
        }, updateObj, {
          new: true
        }, function(err, foodTruck) {
          return res.send({
            status: 200,
            message: req.t('FOOD_TRUCK_UPDATE')
          })
        })
      }
    })
  },

  getUser: function(req, res) {
    foodTruckModel.findOne({
      _id: req.query.userId
    }, function(err, foodTruck) {
      if (foodTruck) {
        let foodTruckDet = foodTruckUtil.foodTruckDetail(foodTruck, ['sharing', 'discount', 'email', 'truckName', 'ownerName', 'phone', 'altPhone'])
        return res.send({
          status: 200,
          result: foodTruckDet,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      }
    })
  },

  delete: function(req, res) {
    foodTruckModel.remove({
      _id: req.body.userId
    }, function(err, foodTruck) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('FOOD_TRUCK_DELETE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      }
    })
  },

  status: function(req, res) {
    foodTruckModel.findOneAndUpdate({
      _id: req.body.userId
    }, {
      status: req.body.status
    }, {
      new: true
    }, function(err, foodTruck) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('FOOD_TRUCK_UPDATE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      }
    })
  },

  list: function(req, res) {
    foodTruckModel.find().sort({
      createdAt: -1
    }).skip(+process.env.ADMIN_LIMIT * req.query.page).limit(req.query.page == '' ? 1000 : +process.env.ADMIN_LIMIT)

    .then(function(result) {
      if (result.length > 0) {
        return res.send({
          status: 200,
          result: result,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      }
    }).catch(function(err) {
      console.log(err);
    })
  }
}

module.exports = foodTruckCtr
