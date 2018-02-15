// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let userCtr = require('./userController.js')
let userRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /user/create User Create
  @apiName usercreate
  @apiGroup user
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {form-data} Header-Example
  *{
    "Content-Type": multipart/form-data
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} name Name Of User
  *@apiParam {Files} image Image Of User
  *@apiParam {Number} price Price Of User

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "User Not Created"
    *}
*/
// multipartMiddleware, auth.checkToken, auth.isAuthenticatedUser,
let createMiddleware = [userCtr.create]
userRouter.post('/create', createMiddleware)

module.exports = userRouter