// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let ordersCtr = require('./ordersController.js')

let ordersRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /orders/create Orders Create
  @apiName orderscreate
  @apiGroup Orders
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId Rfid Card Id Of Orders
  *@apiParam {Array} orderItems Product Detail {productId, productName, productPrice, productQuantity} of Current Order

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "orders":
      {
        "_id": _id,
        "tokenNumber": tokenNumber,
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Order Not Created"
    *}
*/
let createMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedFoodTruck, ordersCtr.create]
ordersRouter.post('/create', createMiddleware)

/**
  @api {post} /orders/update Orders Update
  @apiName ordersupdate
  @apiGroup Orders
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} orderId Id Of Order to Update

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "Order Update Successfully"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Order Not Update"
    *}
*/
let updateMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedFoodTruck, ordersCtr.update]
ordersRouter.post('/update', updateMiddleware)

/**
  @api {get} /orders/list Orders List
  @apiName orderslist
  @apiGroup Orders
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} status Status of Orders to show completed or pending
  *@apiParam {Boolean} isToday to display today's order or not
  *@apiParam {Date} fromDate From date
  *@apiParam {Date} toDate To date
  *@apiParam {Time} fromTime From Time
  *@apiParam {Time} toTime To Time
  *@apiParam {Number} page Page Number, start with 0, to show next set of Orders start

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "productCount": productCount,
    "message": "SUCCESS",
    "orders":
      {
        "_id": _id,
        "status": status,
        "orderId" : 25,
        "date": date,
        "rfidCardId": rfidCardId,
        "orderItems": orderItems
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Order Not Found"
    *}
*/
let listMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedFoodTruck, ordersCtr.list]
ordersRouter.get('/list', listMiddleware)

let adminListMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, ordersCtr.adminList]
ordersRouter.get('/adminlist', adminListMiddleware)

/**
  @api {get} /orders/detail Order Detail
  @apiName orderdetails
  @apiGroup Orders
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.xxxxxhwUz9xk"
  *}

  *@apiParam {String} orderId Oreder Id

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "orders": [{
      "_id": "58fef519fb85651dc5237a95",
      "rfidCardId": "5555555555",
      "__v": 0,
      "createdAt": "2017-04-25T07:01:54.521Z",
      "status": "pending",
      "orderTotalPrice": 800,
      "tokenNumber": 2,
      "orderItems": [
        {
          "productId": "58f86c1df57071027ed2436a",
          "productName": "Paneer Taka Tak1",
          "productPrice": 500,
          "productQuantity": 1
        },
        {
          "productId": "58f86c1df57071027ed2436a",
          "productName": "Paneer Taka Tak2",
          "productPrice": 300,
          "productQuantity": 1
        }
      ]
    }]
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Order Not Found"
    *}
*/
ordersRouter.get('/detail',
    auth.checkToken,
    auth.isAuthenticatedFoodTruck,
    ordersCtr.orderDetails
  )
  /**
    @api {post} /orders/change Change Order details
    @apiName orderchange
    @apiGroup Orders
    @apiVersion 0.1.0

    *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
    *@apiHeaderExample {json} Header-Example
    *{
      "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTxxxxxPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
    *}

    *@apiParam {String} orderId Order Id
    *@apiParam {Array} orderItems Product Detail {productId, productName, productPrice, productQuantity} of Current Order

    *@apiSuccessExample Success-Response
    *HTTP/1.1 1 ok
    *{
      "status": 200,
      "message": "Order updated"
    *}

    *@apiErrorExample Failure-Response
      *HTTP/1.1 0 ok
      *{
        "status": 400,
        "message": "Order Not Created"
      *}
    *@apiErrorExample Failure-Response
      *HTTP/1.1 0 ok
      *{
        "status": 400,
        "message": "Insufficient balance"
      *}
  */
ordersRouter.post('/change',
    auth.checkToken,
    auth.isAuthenticatedFoodTruck,
    ordersCtr.changeOrder
  )
  /**
    @api {get} /orders/transaction Order Transaction
    @apiName ordertransaction
    @apiGroup Orders
    @apiVersion 0.1.0

    *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
    *@apiHeaderExample {json} Header-Example
    *{
      "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTxxxxxPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
    *}

    *@apiParam {Number} page Page Number, start with 0, to show next set of Orders start

    *@apiSuccessExample Success-Response
    *HTTP/1.1 1 ok
    *{
      "status": 200,
      "orders": orders,
      "message": "SUCCESS"
    *}

    *@apiErrorExample Failure-Response
      *HTTP/1.1 0 ok
      *{
        "status": 400,
        "message": "No Record Found"
      *}
  */
ordersRouter.get('/transaction',
  auth.checkToken,
  auth.isAuthenticatedUser,
  ordersCtr.ordersTransaction
)

ordersRouter.get('/trucktransaction',
  auth.checkToken,
  auth.isAuthenticatedAdmin,
  ordersCtr.truckTransaction)

module.exports = ordersRouter
