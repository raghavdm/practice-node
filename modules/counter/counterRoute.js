// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let counterCtr = require('./counterController.js')
let counterRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /counter/create Counter Create
  @apiName countercreate
  @apiGroup Counter
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} name Name Of Counter

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "counter":
      {
        "_id": _id,
        "name": name,
        "createdAt": createdAt
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Counter Not Created"
    *}
*/
let createMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, counterCtr.create]
counterRouter.post('/create', createMiddleware)

/**
  @api {post} /counter/edit Counter Edit
  @apiName counteredit
  @apiGroup Counter
  @apiVersion 0.1.0

  *@apiParam {String} name Name Of Counter

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
      "message": "Counter Not Found"
    *}
*/
let editMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, counterCtr.edit]
counterRouter.post('/edit', editMiddleware)

/**
  @api {post} /counter/delete Counter Delete
  @apiName counterdelete
  @apiGroup Counter
  @apiVersion 0.1.0

  *@apiParam {String} counterId Id Of Counter

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
      "message": "Counter Not Found"
    *}
*/
let deleteMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, counterCtr.delete]
counterRouter.post('/delete', deleteMiddleware)

/**
  @api {get} /counter/getcounter Counter Detail
  @apiName getcounter
  @apiGroup Counter
  @apiVersion 0.1.0

  *@apiParam {String} counterId Id Of Counter

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
      "message": "Counter Not Found"
    *}
*/
let getCounterMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, counterCtr.getCounter]
counterRouter.get('/getcounter', getCounterMiddleware)

/**
  @api {get} /counter/list Counter List
  @apiName counterlist
  @apiGroup Counter
  @apiVersion 0.1.0

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "counter":
      {
        "_id": _id,
        "name": name,
        "counterId": counterId,
        "createdAt": createdAt
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Counter Not Found"
    *}
*/
let listMiddleware = [multipartMiddleware, counterCtr.list]
counterRouter.get('/list', listMiddleware)

module.exports = counterRouter
