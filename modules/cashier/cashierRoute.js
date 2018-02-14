// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let cashierCtr = require('./cashierController.js')

let cashierRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /cashier/login Cashier Login
  @apiName cashierlogin
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {Number} counter Id of Counter
  *@apiParam {String} email Email Address Of Cashier
  *@apiParam {String} deviceToken Device Token for Cashier
  *@apiParam {String} password Password To Corresponding Account

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "cashier":
      {
        "_id": _id,
        "email": email,
        "status": status,
        "cashierName": cashierName,
        "secretToken": secretToken,
        "dailyReports": dailyReports,
        "cardsAllocate": cardsAllocate
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Cashier Not Found"
    *}
*/
let loginMiddleware = [multipartMiddleware, cashierCtr.login]
cashierRouter.post('/login', loginMiddleware)

/**
  @api {post} /cashier/logout Cashier Logout
  @apiName cashierlogout
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {form-data} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} userId Id Of Cashier(optional)

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "Cashier Logout Successfully"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Cashier does not exist."
    *}
*/
let logoutMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmCash, cashierCtr.logout]
cashierRouter.post('/logout', logoutMiddleware)

/**
  @api {post} /cashier/create Cashier Create
  @apiName cashiercreate
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {String} type Type Of Cashier
  *@apiParam {String} email Email Address Of Cashier
  *@apiParam {String} password Password To Corresponding Account
  *@apiParam {String} truckName Truck Name To Corresponding Account

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
      "message": "Cashier with this email is already registered."
    *}
*/
let createMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.create]
cashierRouter.post('/create', createMiddleware)

/**
  @api {post} /cashier/edit Cashier Edit
  @apiName cashieredit
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {String} type Type Of Cashier
  *@apiParam {String} email Email Address Of Cashier
  *@apiParam {String} password Password To Corresponding Account
  *@apiParam {String} truckName Truck Name To Corresponding Account

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
      "message": "Cashier with this email is already registered."
    *}
*/
let editMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.edit]
cashierRouter.post('/edit', editMiddleware)

/**
  @api {post} /cashier/delete Cashier Delete
  @apiName cashierdelete
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Cashier

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
      "message": "No Record Found
"
    *}
*/
let deleteMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.delete]
cashierRouter.post('/delete', deleteMiddleware)

/**
  @api {get} /cashier/getuser Cashier User Detail
  @apiName cashiergetuser
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Cashier

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "result": result,
    "message": "SUCCESS"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "No Record Found
"
    *}
*/
let getUserMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.getUser]
cashierRouter.get('/getuser', getUserMiddleware)

/**
  @api {post} /cashier/status Cashier Status
  @apiName cashierstatus
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Cashier
  *@apiParam {String} status Status Of Cashier

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "cashier": cashier,
    "message": "SUCCESS"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Cashier with this email is already registered."
    *}
*/
let statusMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.status]
cashierRouter.post('/status', statusMiddleware)

/**
  @api {post} /cashier/daliyreports Cashier Show Daliy Reports
  @apiName cashierdaliyreports
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Cashier
  *@apiParam {String} dailyReports Daliy Reports Of Cashier

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
      "message": "Cashier with this email is already registered."
    *}
*/
let dailyReportsMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.dailyReports]
cashierRouter.post('/dailyreports', dailyReportsMiddleware)

/**
  @api {get} /cashier/allocate Cashier List
  @apiName cashierlist
  @apiGroup Cashier
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

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
      "message": "No Record Found"
    *}
*/
let listMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.list]
cashierRouter.get('/list', listMiddleware)

let getAllocateMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.getAllocate]
cashierRouter.get('/getallocate', getAllocateMiddleware)

let getTotalAllocateMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.getTotalAllocate]
cashierRouter.get('/gettotalallocate', getTotalAllocateMiddleware)

let getAllocateListMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.getAllocateList]
cashierRouter.get('/getallocatelist', getAllocateListMiddleware)

let allocateMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, cashierCtr.allocate]
cashierRouter.post('/allocate', allocateMiddleware)

module.exports = cashierRouter
