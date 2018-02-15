let jwt = require('jwt-simple');
let jwtUtil = {};

/*
 * For Create Secret Token For User
 * @param Int uid Uid
 * @return String
 */
jwtUtil.createSecretToken = (data) => {
  let token = jwt.encode(data, config.SECRET);
  return token;
}
  
jwtUtil.decodeToken = (token) => {
  var data = {};
  if (token) {
    try {
      var decoded = jwt.decode(token, config.SECRET);
      data = decoded;
    } catch (err) {
      data
    }
  }
  return data;
}

module.exports = jwtUtil