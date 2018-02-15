let utils = require('../helper/utils.js');
let jwt = require('../helper/jwt.js');
let errorUtil = require('../helper/error.js');
let auth = {};

// auth.checkToken = (req, res, next) => {
//   let token = (req.headers && req.headers['x-auth-token']);
//   if (utils.empty(token)) {
//     token = (req.body && req.body['x-auth-token']);
//   }
//   if (utils.empty(token)) {
//     return res.send({
//       status: 400,
//       message: req.t("NOT_AUTHORIZED")
//     });
//   }
//   req.token = token;
//   next();
// }

// auth.isAuthenticatedUser = (req, res, next) => {
//   let token = (req.headers && req.headers['x-auth-token']);
//   if (utils.empty(token)) {
//     token = (req.body && req.body['x-auth-token']);
//   }
//   let authToken = jwt.decodeToken(token);
//   if (utils.empty(authToken.userId)) {
//     return res.send({
//       status: 400,
//       message: req.t("NOT_AUTHORIZED")
//     });
//   } else {
//     userModel.findOne({
//       _id: authToken.userId,
//       email: authToken.email
//     }).then(function(user) {
//       if (user) {
//         next();
//       } else {
//         return res.send({
//           status: 400,
//           message: req.t("NOT_AUTHORIZED")
//         });
//       }
//     });
//   }
// }

auth.isVerified = (req, res, next) => {
  if (!Boolean(req.authUser.isVerified)) {
    return res.status(400).json(req.t("NOT_VERIFIED"));
  }
  next();
}

module.exports = auth