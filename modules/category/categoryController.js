let jwt = require('../../helper/jwt')
let categoryModel = require('./categoryModel')
let menuModel = require('../menu/menuModel')

let categoryCtr = {
  create: function(req, res) {
    let categoryData = {
      name: req.body.name,
      userId: req.body.userId
    }
    let category = new categoryModel(categoryData)
    category.save(function(err) {
      if (!err) {
        return res.send({
          status: 200,
          category: category,
          message: req.t('CATEGORY_SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('CATEGORY_NOT_CREATED')
        })
      }
    })
  },

  getCategory: function(req, res) {
    categoryModel.findOne({
      _id: req.query.catId
    }, function(err, category) {
      if (category) {
        return res.send({
          status: 200,
          category: category,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('CATEGORY_NOT_FOUND')
        })
      }
    })
  },

  edit: function(req, res) {
    categoryModel.findOneAndUpdate({
      _id: req.body.catId
    }, {
      name: req.body.name,
      userId: req.body.userId,
    }, {
      new: true
    }, function(err, foodTruck) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('CATEGORY_UPDATE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('CATEGORY_NOT_FOUND')
        })
      }
    })
  },

  delete: function(req, res) {
    categoryModel.remove({
      _id: req.body.catId
    }, function(err, category) {
      if (!err) {
        menuModel.remove({ categoryId: req.body.catId }).exec();
        return res.send({
          status: 200,
          message: req.t('CATEGORY_DELETE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('CATEGORY_NOT_FOUND')
        })
      }
    })
  },

  list: function(req, res) {
    let authToken = jwt.decodeToken(req.headers['x-auth-token'])
    let userId = req.query.userId == undefined ? authToken.userId : req.query.userId;
    categoryModel.find({
      userId: userId
    }).sort({
      createdAt: -1
    }).skip(+process.env.ADMIN_LIMIT * req.query.page).limit(req.query.page == '' ? 1000 : +process.env.ADMIN_LIMIT)

    .then(function(category) {
      if (category.length > 0) {
        return res.send({
          status: 200,
          category: category,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('CATEGORY_NOT_FOUND')
        })
      }
    })
  }
}

module.exports = categoryCtr
