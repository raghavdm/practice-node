let utils = require('../helper/utils.js');
let jwt = require('../helper/jwt.js');
let auth = {};

auth.checkToken = (req, res, next) => {
  let token = (req.headers && req.headers['x-auth-token']);
  if (utils.empty(token)) {
    token = (req.body && req.body['x-auth-token']);
  }
  if (utils.empty(token)) {
    return res.send({
      status: 400,
      message: "You are not authorised"
    });
  }
  req.token = token;
  next();
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
      message: "You are not authorised"
    });
  } else {
    userModel.findOne({
      email: authToken.email
    }).then(function(user) {
      if (user) {
        next();
      } else {
        return res.send({
          status: 400,
          message: "You are not authorised"
        });
      }
    });
  }
}

module.exports = auth