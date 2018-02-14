// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let cardsCtr = require('./cardsController.js')

let cardsRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /cards/allocate Cards Allocate
  @apiName cardsallocate
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId Rfid Card Id Of Card
  *@apiParam {String} balance Allocate Balance with Card
  *@apiParam {String} paymentMode Payment Mode details
  *@apiParam {String} validity Validity

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
      "message": "Order Not Created"
    *}
*/
let allocateMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedCashier, cardsCtr.allocate]
cardsRouter.post('/allocate', allocateMiddleware)

/**
  @api {post} /cards/block Cards Block
  @apiName cardsblock
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId Rfid Card Id Of Card

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
      "message": "Card Not Found"
    *}
*/
let blockMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedCashier, cardsCtr.block]
cardsRouter.post('/block', blockMiddleware)

/**
  @api {post} /cards/checkbalance Cards Check Balance
  @apiName cardscheckbalance
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId Rfid Card Id Of Card

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "cards": {
      "balance": 6000,
      "rfidCardId": "788878787",
      "validity": 3,
      "paymentMode": "credit"
    }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Card Not Found"
    *}
*/
let checkBalanceMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedUsers, cardsCtr.checkBalance]
cardsRouter.post('/checkbalance', checkBalanceMiddleware)

/**
  @api {post} /cards/returnbalance Cards Return Balance
  @apiName cardsreturnbalance
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId Rfid Card Id Of Card
  *@apiParam {Number} balance Return Balance(send 0 in case for no reduction) Of Card

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "cards":
      {
        "balance": balance,
        "rfidCardId": rfidCardId
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Card Not Found"
    *}
*/
let returnBalanceMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedCashier, cardsCtr.returnBalance]
cardsRouter.post('/returnbalance', returnBalanceMiddleware)

/**
  @api {post} /cards/topup Cards Topup
  @apiName cardstopup
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId Rfid Card Id Of Card
  *@apiParam {Number} balance Topup Balance to do for Card
  *@apiParam {String} paymentMode Payment Mode Details

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "cards":
      {
        "balance": balance,
        "rfidCardId": rfidCardId,
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Card Not Found"
    *}
*/
let topupMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedCashier, cardsCtr.topup]
cardsRouter.post('/topup', topupMiddleware)

/**
  @api {post} /cards/consolidate/ Card Consolidate
  @apiName cardsconsolidate
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOxxxZhwUz9xk"
  *}

  *@apiParam {String} validity Validity
  *@apiParam {String} paymentMode Payment Mode details
  *@apiParam {String} balance Allocate Balance with Card
  *@apiParam {String} rfidCardId rfidCardId of Broken Card
  *@apiParam {String} rfidCardIdNew rfidCardId of Consolidate Card

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "Card Consolidate Successfully",
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "No Record Found"
    *}
*/
let consolidateMiddleware = [auth.checkToken, auth.isAuthenticatedCashier, cardsCtr.consolidate]
cardsRouter.post('/consolidate/', consolidateMiddleware)

/**
  @api {get} /cards/card-history/ Card History
  @apiName cardscardhistory
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOxxxZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId rfid card id

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "history": [
    {
      "date": "2017-04-28T11:52:04.616Z",
      "entryType": "debit",
      "truckName": "food",
      "productName": "Punjab Paneer Pizza",
      "productPrice": 120,
      "productQuantity": 3
      "amount": 360
    },
    {
      "date": "2017-04-28T12:53:43.411Z",
      "entryType": "credit",
      "counter": 3,
      "amount": 60
    },
    {
      "date": "2017-05-04 15:14:59",
      "entryType": "refund",
      "amount": 100
    }...]
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "No Record Found"
    *}
*/
let cardsHistoryMiddleware = [auth.checkToken, auth.isAuthenticatedCashier, cardsCtr.cardHistory]
cardsRouter.get('/card-history/', cardsHistoryMiddleware)

/**
  @api {get} /cards/active-list/ Active Card List
  @apiName cardsactivelist
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOxxxZhwUz9xk"
  *}

  *@apiParam {String} rfidCardId rfid card id
  *@apiParam {Number} page Page Number, start with 0, to show next set of Orders start

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "cards": [
    {
      "_id": "58fef90a850f9b1e34fa1ff9",
      "userId": "58f86781f57071027ed24351",
      "balance": 100,
      "rfidCardId": "1234567890123456",
      "__v": 0,
      "createdAt": "2017-04-25T07:21:45.742Z",
      "status": "allocate"
    },...]
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "No Record Found"
    *}
*/
cardsRouter.get(
  '/active-list/',
  auth.checkToken,
  auth.isAuthenticatedCashier,
  cardsCtr.activeList
)

/**
  @api {get} /cards/daily-report/ Daily Report List
  @apiName cardsdailyreportlist
  @apiGroup Cards
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOxxxZhwUz9xk"
  *}

  *@apiParam {Number} page Page Number, start with 0, to show next set of Orders start
  *@apiParam {String} paymentMode credit or cash
  *@apiParam {String} status allocate, block, refund, topup
  *@apiParam {time} from from time
  *@apiParam {time} to to time

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "totalAmount": 150,
    "cards": [
      {
        "_id": "59098e414d53562ebc629fcd",
        "rfidCardId": "9428808010",
        "createdAt": "2017-05-03 07:40:55",
        "type": "topup",
        "amount": 50,
        "counter": 3
      },...
    ]
  *}
  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "No Record Found"
    *}
*/
cardsRouter.get(
  '/daily-report/',
  auth.checkToken,
  auth.isAuthenticatedCashier,
  cardsCtr.dailyReports
)

cardsRouter.get('/cashcounter',
  auth.checkToken,
  auth.isAuthenticatedAdmin,
  cardsCtr.cashCounter)

cardsRouter.get('/cardslist',
  auth.checkToken,
  auth.isAuthenticatedAdmin,
  cardsCtr.cardsList)

cardsRouter.get('/cashtransaction',
  auth.checkToken,
  auth.isAuthenticatedAdmin,
  cardsCtr.cashTransaction)

cardsRouter.post('/reversetransaction',
  auth.checkToken,
  auth.isAuthenticatedAdmin,
  cardsCtr.reversedTrans)

cardsRouter.get('/cardsdetail',
  auth.checkToken,
  auth.isAuthenticatedAdmin,
  cardsCtr.cardsDetail)

module.exports = cardsRouter
