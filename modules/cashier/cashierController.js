let md5 = require('md5')
let _ = require('lodash')
let moment = require('moment')
let jwt = require('../../helper/jwt')
let utils = require('../../helper/utils')
let cashierUtil = require('./cashierHelper')
let cashierModel = require('./cashierModel')
let counterModel = require('../counter/counterModel')
let cashierTrackModel = require('./cashierTrackModel')
let cashierAllocateModel = require('./cashierAllocateModel')

let cashierCtr = {
  login: function(req, res) {
    cashierModel.findOne({
      email: req.body.email.toLowerCase()
    }).then(function(cashier) {
      if (!cashier) {
        return res.send({
          status: 400,
          message: req.t('NOT_VALID_CASHIER')
        })
      } else if (md5(req.body.password) !== cashier.password) {
        return res.send({
          status: 400,
          message: req.t('PASSWORD_NOT_FOUND')
        })
      } else if (cashier.login) {
        return res.send({
          status: 400,
          message: req.t('ALREADY_LOGIN')
        })
      } else if (cashier.status == 'Block') {
        return res.send({
          status: 400,
          message: req.t('USER_BLOCK')
        })
      } else {
        let counterData = {}
        counterModel.findOne({
          _id: req.body.counter
        }).exec(function(err, result) {
          counterData = result;

          cashierModel.findOne({
            login: true,
            counter: req.body.counter
          }).then(function(cashierCounter) {
            if (cashierCounter) {
              return res.send({
                status: 200,
                message: "You can\'t login from " + counterData.name
              })
            }

            cashierAllocateModel.findOne({
              cashierId: cashier._id,
              session: { $ne: 'end' },
              createdAt: {
                $gte: new Date(moment().utc().startOf('day'))
              }
            }, function(err, cashierAllData) {
              if (!cashierAllData) {
                return res.send({
                  status: 400,
                  message: "Please ask Admin to Start Your Session."
                })
              }
              let token = jwt.createSecretToken({
                'userId': cashier._id,
                'email': cashier.email,
                'deviceToken': req.body.deviceToken
              })
              let cashierData = {
                _id: cashier._id,
                secretToken: token,
                email: cashier.email,
                status: cashier.status,
                cashierName: cashier.cashierName,
                dailyReports: cashier.dailyReports,
                cardsAllocate: cashier.cardsAllocate,
                cashAmount: cashierAllData.cashAllocate,
                cardsAllocatedUser: cashierAllData == null ? 0 : cashierAllData.cardsAllocate - cashier.cardsAllocate
              }
              let cashierTrackData = {
                cashierId: cashier._id,
                counter: counterData._id
              }
              cashierModel.findOneAndUpdate({
                'email': cashier.email
              }, {
                login: true,
                counter: counterData._id,
                deviceToken: req.body.deviceToken
              }).exec(function(err, doc) {
                if (err) {
                  console.log(err)
                }
              })
              let cashierTrack = new cashierTrackModel(cashierTrackData)
              cashierTrack.save(function(err) {
                if (!err) {
                  return res.send({
                    status: 200,
                    cashier: cashierData,
                    message: req.t('LOGIN_SUCCESS')
                  })
                } else {
                  return res.send({
                    status: 400,
                    message: req.t('CASHIER_NOT_LOGIN')
                  })
                }
              })
            })
          })
        })
      }
    })
  },

  logout: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    let userId = req.body.userId != undefined ? req.body.userId : authToken.userId
    cashierModel.findOneAndUpdate({
      _id: userId
    }, {
      login: false
    }, {
      new: true
    }, function(err) {
      if (err) {
        return res.send({
          status: 400,
          message: req.t('NOT_VALID_CASHIER')
        })
      } else {
        return res.send({
          status: 200,
          message: req.t('CASHIER_LOGOUT')
        })
      }
    })
  },

  create: function(req, res) {
    cashierModel.findOne({
      email: req.body.email.toLowerCase()
    }).then(function(err) {
      if (err) {
        return res.send({
          status: 400,
          message: req.t('CASHIER_EMAIL_REGISTERED')
        })
      } else {
        let cashierData = {
          type: req.body.type,
          password: md5(req.body.password),
          cashierName: req.body.cashierName,
          email: req.body.email.toLowerCase()
        }
        let cashier = new cashierModel(cashierData)
        cashier.save(function(err) {
          return res.send({
            status: 200,
            message: req.t('CASHIER_CREATE')
          })
        })
      }
    })
  },

  edit: function(req, res) {
    cashierModel.findOne({
      _id: { $nin: req.body.userId },
      email: req.body.email.toLowerCase()
    }).then(function(result) {
      if (result) {
        return res.send({
          status: 400,
          message: req.t('CASHIER_EMAIL_REGISTERED')
        })
      } else {
        let updateObj = {
          type: req.body.type,
          cashierName: req.body.cashierName,
          email: req.body.email.toLowerCase()
        }
        if (!utils.empty(req.body.password)) {
          updateObj = _.extend(updateObj, { password: md5(req.body.password) })
        }
        cashierModel.findOneAndUpdate({
          _id: req.body.userId
        }, updateObj, {
          new: true
        }, function(err, cashier) {
          return res.send({
            status: 200,
            message: req.t('CASHIER_UPDATE')
          })
        })
      }
    })
  },

  delete: function(req, res) {
    cashierModel.remove({
      _id: req.body.userId
    }, function(err, cashier) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('CASHIER_DELETE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      }
    })
  },

  getUser: function(req, res) {
    cashierModel.findOne({
      _id: req.query.userId
    }, function(err, cashier) {
      if (cashier) {
        let cashierDet = cashierUtil.cashierDetail(cashier, ['email', 'cashierName', 'login'])
        return res.send({
          status: 200,
          result: cashierDet,
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

  status: function(req, res) {
    cashierModel.findOneAndUpdate({
      _id: req.body.userId
    }, {
      status: req.body.status
    }, {
      new: true
    }, function(err, cashier) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('CASHIER_UPDATE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      }
    })
  },

  dailyReports: function(req, res) {
    cashierModel.findOneAndUpdate({
      _id: req.body.userId
    }, {
      dailyReports: req.body.dailyReports
    }, {
      new: true
    }, function(err, cashier) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('CASHIER_UPDATE')
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
    cashierModel.find().sort({
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
    })
  },

  getAllocate: function(req, res) {
    cashierAllocateModel.findOne({
      session: { $ne: 'end' },
      cashierId: req.query.cashierId,
      createdAt: {
        $gte: new Date(moment().utc().startOf('day'))
      }
    }, function(err, cashierAllData) {
      if (!err) {
        return res.send({
          status: 200,
          result: cashierAllData,
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

  getTotalAllocate: function(req, res) {
    let condition = {};
    if (req.query.from) {
      condition["createdAt"] = {
        $lte: new Date(req.query.to),
        $gte: new Date(req.query.from)
      }
    }

    cashierAllocateModel.aggregate({
      $match: condition
    }, {
      $group: {
        _id: null,
        cardsAllocate: { $sum: { $add: '$cardsAllocate' } }
      }
    }, function(err, cashierAllData) {
      if (cashierAllData.length > 0) {
        return res.send({
          status: 200,
          result: cashierAllData,
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

  getAllocateList: function(req, res, next) {
    cashierAllocateModel.find({
      cashierId: !req.query.cashierId ? { $ne: null } : req.query.cashierId,
      createdAt: !req.query.from ? { $ne: null } : { $gte: req.query.from, $lte: req.query.to }
    }).sort({
      createdAt: -1
    }).populate('cashierId', 'cashierName').skip(req.query.page != 'all' ? +process.env.ADMIN_LIMIT * req.query.page : 0).limit(req.query.sorting != '' || req.query.page == 'all' ? +process.env.SORTING_LIMIT : +process.env.ADMIN_LIMIT)

    .then(function(cashierAllData) {
      if (cashierAllData.length == 0) {
        return res.send({
          status: 400,
          message: req.t('NO_RECORD_FOUND')
        })
      } else {
        if (!req.query.sorting) {
          return res.send({
            status: 200,
            result: cashierAllData,
            message: req.t('SUCCESS')
          })
        } else {
          if (req.query.sorting == 'daily') {
            let cashierAllDataDaily = [];
            let cashierAllDataDate = false;
            let k = 0;
            for (i = 0; i < cashierAllData.length; i++) {
              for (j = 0; j < cashierAllDataDaily.length; j++) {
                if (cashierAllDataDaily[j].createdAt == moment(cashierAllData[i].createdAt).format('dddd, MMMM DD YYYY')) {
                  cashierAllDataDate = true;
                  cashierAllDataDaily[j].cardsReturn += cashierAllData[i].cardsReturn;
                  cashierAllDataDaily[j].cashAllocate += cashierAllData[i].cashAllocate;
                  cashierAllDataDaily[j].cardsAllocate += cashierAllData[i].cardsAllocate;
                } else if (j == cashierAllDataDaily.length - 1 && cashierAllDataDate) {
                  cashierAllDataDate = false;
                }
              }
              if (cashierAllDataDate == false) {
                cashierAllDataDaily[k] = {};
                cashierAllDataDaily[k].createdAt = moment(cashierAllData[i].createdAt).format('dddd, MMMM DD YYYY')
                cashierAllDataDaily[k].cardsReturn = 0;
                cashierAllDataDaily[k].cashAllocate = 0;
                cashierAllDataDaily[k].cardsAllocate = 0;
                cashierAllDataDaily[k].cardsReturn += cashierAllData[i].cardsReturn;
                cashierAllDataDaily[k].cashAllocate += cashierAllData[i].cashAllocate;
                cashierAllDataDaily[k].cardsAllocate += cashierAllData[i].cardsAllocate;
                if (req.query.cashierId != '') {
                  cashierAllDataDaily[k].cashierName = cashierAllData[i].cashierId.cashierName;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              result: cashierAllDataDaily,
              message: req.t('SUCCESS')
            })
          } else if (req.query.sorting == 'month') {
            let cashierAllDataDaily = [];
            let cashierAllDataDate = false;
            let k = 0;
            for (i = 0; i < cashierAllData.length; i++) {
              for (j = 0; j < cashierAllDataDaily.length; j++) {
                if (cashierAllDataDaily[j].createdAt == moment(cashierAllData[i].createdAt).format('MMMM YYYY')) {
                  cashierAllDataDate = true;
                  cashierAllDataDaily[j].cardsReturn += cashierAllData[i].cardsReturn;
                  cashierAllDataDaily[j].cashAllocate += cashierAllData[i].cashAllocate;
                  cashierAllDataDaily[j].cardsAllocate += cashierAllData[i].cardsAllocate;
                } else if (j == cashierAllDataDaily.length - 1 && cashierAllDataDate) {
                  cashierAllDataDate = false;
                }
              }
              if (cashierAllDataDate == false) {
                cashierAllDataDaily[k] = {};
                cashierAllDataDaily[k].createdAt = moment(cashierAllData[i].createdAt).format('MMMM YYYY')
                cashierAllDataDaily[k].cardsReturn = 0;
                cashierAllDataDaily[k].cashAllocate = 0;
                cashierAllDataDaily[k].cardsAllocate = 0;
                cashierAllDataDaily[k].cardsReturn += cashierAllData[i].cardsReturn;
                cashierAllDataDaily[k].cashAllocate += cashierAllData[i].cashAllocate;
                cashierAllDataDaily[k].cardsAllocate += cashierAllData[i].cardsAllocate;
                if (req.query.cashierId != '') {
                  cashierAllDataDaily[k].cashierName = cashierAllData[i].cashierId.cashierName;
                }
                k++;
              }
            }
            res.send({
              status: 200,
              result: cashierAllDataDaily,
              message: req.t('SUCCESS')
            })
          }
        }
      }
    }).catch(function(err) {
      next(err);
    })
  },

  allocate: function(req, res, next) {
    cashierAllocateModel.findOne({
      session: { $ne: 'end' },
      cashierId: req.body.cashierId,
      createdAt: {
        $gte: new Date(moment().utc().startOf('day'))
      }
    }, function(err, cashierAllData) {
      if (err) {
        return res.send({
          status: 400,
          message: req.t('CASHIER_ALLOCATE')
        })
      } else if (!cashierAllData) {
        cashierAllocateModel.update({
          cashierId: req.body.cashierId
        }, {
          session: 'end'
        }, {
          multi: true
        }, function(err) {
          let cashierAllocateData = {
            createdAt: new Date(),
            cashierId: req.body.cashierId,
            cashAllocate: req.body.cashAllocate,
            cardsAllocate: req.body.cardsAllocate,
            session: req.body.session.toLowerCase()
          }
          let cashierAllocate = new cashierAllocateModel(cashierAllocateData)
          cashierAllocate.save(function(err) {
            if (!err) {
              cashierModel.findOneAndUpdate({
                _id: req.body.cashierId
              }, {
                cardsAllocate: req.body.cardsAllocate
              }, function(err) {
                if (!err) {
                  return res.send({
                    status: 200,
                    message: req.t('SUCCESS')
                  })
                } else {
                  return res.send({
                    status: 400,
                    message: req.t('CASHIER_ALLOCATE')
                  })
                }
              })
            } else {
              return res.send({
                status: 400,
                message: req.t('CASHIER_ALLOCATE')
              })
            }
          })
        })
      } else {
        cashierModel.findOne({
          _id: req.body.cashierId
        }, function(err, cashierCard) {
          if (err) {
            return res.send({
              status: 400,
              message: req.t('CASHIER_ALLOCATE')
            })
          } else {
            cashierAllocateModel.findOneAndUpdate({
              session: { $ne: 'end' },
              cashierId: req.body.cashierId,
              createdAt: {
                $gte: new Date(moment().utc().startOf('day'))
              }
            }, {
              cardsReturn: req.body.cardsReturn,
              session: req.body.session.toLowerCase(),
              $inc: { cardsAllocate: req.body.cardsAllocate }
            }, function(err) {
              if (!err) {
                cashierModel.findOneAndUpdate({
                  _id: req.body.cashierId
                }, {
                  $inc: { cardsAllocate: req.body.cardsReturn > 0 ? -req.body.cardsReturn : req.body.cardsAllocate }
                }, function(err) {
                  return res.send({
                    status: 400,
                    message: req.t('SUCCESS')
                  })
                })
              }
            })
          }
        })
      }
    })
  }
}

module.exports = cashierCtr