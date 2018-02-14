let md5 = require('md5')
let jwt = require('../../helper/jwt')
let adminModel = require('./adminModel')
let adminUtil = require('./adminHelper')
let utils = require('../../helper/utils')

let adminCtr = {
  login: function(req, res) {
    adminModel.findOne({
      email: req.body.email.toLowerCase()
    }).then(function(admin) {
      if (!admin) {
        return res.send({
          status: 400,
          message: req.t('NOT_VALID_ADMIN')
        })
      } else if (md5(req.body.password) !== admin.password) {
        return res.send({
          status: 400,
          message: req.t('PASSWORD_NOT_FOUND')
        })
      } else {
        let token = jwt.createSecretToken({
          'role': admin.role,
          'userId': admin._id,
          'email': admin.email
        })
        let adminData = {
          role: admin.role,
          secretToken: token
        }
        return res.send({
          status: 200,
          admin: adminData,
          message: req.t('SUCCESS')
        })
      }
    }).catch(function(err) {
      console.log(err);
    })
  },

  create: function(req, res) {
    adminModel.findOne({
      email: req.body.email.toLowerCase()
    }).then(function(err) {
      if (err) {
        return res.send({
          status: 400,
          message: req.t('ADMIN_EMAIL_REGISTERED')
        })
      } else {
        let adminData = {
          name: req.body.name,
          password: md5(req.body.password),
          role: req.body.role.toLowerCase(),
          email: req.body.email.toLowerCase()
        }
        let admin = new adminModel(adminData)
        admin.save(function(err) {
          return res.send({
            status: 200,
            message: req.t('ADMIN_CREATE')
          })
        })
      }
    })
  },

  edit: function(req, res) {
    adminModel.findOne({
      _id: { $nin: req.body.userId },
      email: req.body.email.toLowerCase()
    }).then(function(result) {
      if (result) {
        return res.send({
          status: 400,
          message: req.t('ADMIN_EMAIL_REGISTERED')
        })
      } else {
        let updateObj = {
          adminName: req.body.adminName,
          role: req.body.role.toLowerCase(),
          email: req.body.email.toLowerCase()
        }
        if (!utils.empty(req.body.password)) {
          updateObj = _.extend(updateObj, { password: md5(req.body.password) })
        }
        adminModel.findOneAndUpdate({
          _id: req.body.userId
        }, updateObj, {
          new: true
        }, function(err, admin) {
          return res.send({
            status: 200,
            message: req.t('ADMIN_UPDATE')
          })
        })
      }
    }).catch(function(err) {
      console.log(err);
    })
  },

  delete: function(req, res) {
    adminModel.remove({
      _id: req.body.userId
    }, function(err, admin) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('ADMIN_DELETE')
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
    adminModel.find({}).sort({
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

  getUser: function(req, res) {
    adminModel.findOne({
      _id: req.query.userId
    }, function(err, admin) {
      if (admin) {
        let adminDet = adminUtil.adminDetail(admin, ['email', 'name', 'role'])
        return res.send({
          status: 200,
          result: adminDet,
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

  getSetting: function(req, res) {
    adminModel.findOne({
      role: 'super'
    }, {
      _id: 0,
      faceValue: 1,
      happyHours: 1,
      happyHrsDis: 1,
      promoDiscount: 1
    }, function(err, result) {
      if (err) {
        return res.send({
          status: 400,
          message: req.t('NOT_VALID_ADMIN')
        })
      } else {
        return res.send({
          status: 200,
          result: result,
          message: req.t('SUCCESS')
        })
      }
    })
  },

  saveSetting: function(req, res) {
    adminModel.update({
      role: 'super'
    }, {
      faceValue: req.body.faceValue,
      happyHours: req.body.happyHours,
      happyHrsDis: req.body.happyHrsDis,
      promoDiscount: req.body.promoDiscount
    }, {
      multi: true
    }, function(err) {
      if (err) {
        return res.send({
          status: 400,
          message: req.t('NOT_VALID_ADMIN')
        })
      } else {
        return res.send({
          status: 200,
          message: req.t('ADMIN_SETTING')
        })
      }
    })
  }
}

module.exports = adminCtr
