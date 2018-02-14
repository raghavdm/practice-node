let utils = require('../helper/utils.js');
let jwt = require('../helper/jwt.js');
let errorUtil = require('../helper/error.js');
let adminModel = require('../modules/admin/adminModel.js');
let foodTruckModel = require('../modules/foodtruck/foodTruckModel.js');
let cashierModel = require('../modules/cashier/cashierModel.js');
let auth = {};
auth.checkToken = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  if (utils.empty(token)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  }
  req.token = token;
  next();
}

auth.isAuthenticatedFoodTruck = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  let authToken = jwt.decodeToken(token);
  if (utils.empty(authToken.userId)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  } else {
    foodTruckModel.findOne({
      _id: authToken.userId,
      email: authToken.email
    }).then(function(user) {
      if (user) {
        if (user.status == 'Block') {
          return res.send({
            status: 400,
            message: req.t("USER_BLOCK")
          });
        } else
          next();
      } else {
        return res.send({
          status: 400,
          message: req.t("NOT_AUTHORIZED")
        });
      }
    });
  }
}

auth.isAuthenticatedCashier = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  let authToken = jwt.decodeToken(token);
  if (utils.empty(authToken.userId)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  } else {
    cashierModel.findOne({
      _id: authToken.userId,
      email: authToken.email
    }).then(function(user) {
      if (user) {
        if (user.status == 'Block') {
          return res.send({
            status: 400,
            message: req.t("USER_BLOCK")
          });
        } else if (user.deviceToken != authToken.deviceToken || user.deviceToken == '' || user.login == false) {
          return res.send({
            status: 400,
            isLogout: true,
            message: req.t("NOT_AUTHORIZED")
          });
        } else
          next();
      } else {
        return res.send({
          status: 400,
          message: req.t("NOT_AUTHORIZED")
        });
      }
    }).catch(function(err) {
      console.log(err);
    });
  }
}

auth.isAuthenticatedAdmin = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  let authToken = jwt.decodeToken(token);
  if (utils.empty(authToken.userId)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  } else {
    adminModel.findOne({
      _id: authToken.userId,
      email: authToken.email
    }).then(function(user) {
      if (user) {
        next();
      } else {
        return res.send({
          status: 400,
          message: req.t("NOT_AUTHORIZED")
        });
      }
    });
  }
}

auth.isAuthenticatedUser = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  let authToken = jwt.decodeToken(token);
  if (utils.empty(authToken.userId)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  } else {
    foodTruckModel.findOne({
      _id: authToken.userId,
      email: authToken.email
    }).then(function(user) {
      if (user) {
        if (user.status == 'Block') {
          return res.send({
            status: 400,
            message: req.t("USER_BLOCK")
          });
        } else
          next();
      } else {
        adminModel.findOne({
          _id: authToken.userId,
          email: authToken.email
        }).then(function(users) {
          if (users) {
            next();
          } else {
            return res.send({
              status: 400,
              message: req.t("NOT_AUTHORIZED")
            });
          }
        });
      }
    });
  }
}

auth.isAuthenticatedAdmCash = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  let authToken = jwt.decodeToken(token);
  if (utils.empty(authToken.userId)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  } else {
    cashierModel.findOne({
      _id: authToken.userId,
      email: authToken.email
    }).then(function(user) {
      if (user) {
        if (user.status == 'Block') {
          return res.send({
            status: 400,
            message: req.t("USER_BLOCK")
          });
        } else
          next();
      } else {
        adminModel.findOne({
          _id: authToken.userId,
          email: authToken.email
        }).then(function(users) {
          if (users) {
            next();
          } else {
            return res.send({
              status: 400,
              message: req.t("NOT_AUTHORIZED")
            });
          }
        });
      }
    });
  }
}

auth.isAuthenticatedUsers = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  let authToken = jwt.decodeToken(token);
  if (utils.empty(authToken.userId)) {
    return res.send({
      status: 400,
      message: req.t("NOT_AUTHORIZED")
    });
  } else {
    foodTruckModel.findOne({
      _id: authToken.userId,
      email: authToken.email
    }).then(function(user) {
      if (user) {
        if (user.status == 'Block') {
          return res.send({
            status: 400,
            message: req.t("USER_BLOCK")
          });
        } else
          next();
      } else {
        cashierModel.findOne({
          _id: authToken.userId,
          email: authToken.email
        }).then(function(users) {
          if (users) {
            if (users.status == 'Block') {
              return res.send({
                status: 400,
                message: req.t("USER_BLOCK")
              });
            } else
              next();
          } else {
            return res.send({
              status: 400,
              message: req.t("NOT_AUTHORIZED")
            });
          }
        });
      }
    });
  }
}

auth.isVerified = (req, res, next) => {
  if (!Boolean(req.authUser.isVerified)) {
    return res.status(400).json(req.t("NOT_VERIFIED"));
  }
  next();
}

module.exports = auth
