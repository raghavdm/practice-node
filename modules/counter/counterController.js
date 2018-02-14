let jwt = require('../../helper/jwt')
let counterModel = require('./counterModel')

let counterCtr = {
  create: function(req, res) {
    let counterData = {
      name: req.body.name
    }
    let counter = new counterModel(counterData)
    counter.save(function(err) {
      if (!err) {
        return res.send({
          status: 200,
          counter: counter,
          message: req.t('COUNTER_SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('COUNTER_NOT_CREATED')
        })
      }
    })
  },

  getCounter: function(req, res) {
    counterModel.findOne({
      _id: req.query.countId
    }, function(err, counter) {
      if (counter) {
        return res.send({
          status: 200,
          counter: counter,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('COUNTER_NOT_FOUND')
        })
      }
    })
  },

  edit: function(req, res) {
    counterModel.findOneAndUpdate({
      _id: req.body.countId
    }, {
      name: req.body.name,
    }, {
      new: true
    }, function(err, foodTruck) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('COUNTER_UPDATE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('COUNTER_NOT_FOUND')
        })
      }
    })
  },

  delete: function(req, res) {
    counterModel.remove({
      _id: req.body.countId
    }, function(err, counter) {
      if (!err) {
        return res.send({
          status: 200,
          message: req.t('COUNTER_DELETE')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('COUNTER_NOT_FOUND')
        })
      }
    })
  },

  list: function(req, res) {
    counterModel.find({}).sort({ counterId: -1 }).then(function(counter) {
      if (counter.length > 0) {
        return res.send({
          status: 200,
          counter: counter,
          message: req.t('SUCCESS')
        })
      } else {
        return res.send({
          status: 400,
          message: req.t('COUNTER_NOT_FOUND')
        })
      }
    })
  }
}

module.exports = counterCtr