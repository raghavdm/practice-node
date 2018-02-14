// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let categoryCtr = require('./categoryController.js')
let categoryRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /category/create Category Create
  @apiName categorycreate
  @apiGroup Category
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} name Name Of Category

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "category":
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
      "message": "Category Not Created"
    *}
*/
let createMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, categoryCtr.create]
categoryRouter.post('/create', createMiddleware)

/**
  @api {post} /category/edit Category Edit
  @apiName categoryedit
  @apiGroup Category
  @apiVersion 0.1.0

  *@apiParam {String} name Name Of Category

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
      "message": "Category Not Found"
    *}
*/
let editMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, categoryCtr.edit]
categoryRouter.post('/edit', editMiddleware)

/**
  @api {post} /category/delete Category Delete
  @apiName categorydelete
  @apiGroup Category
  @apiVersion 0.1.0

  *@apiParam {String} catId Id Of Category

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
      "message": "Category Not Found"
    *}
*/
let deleteMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, categoryCtr.delete]
categoryRouter.post('/delete', deleteMiddleware)

/**
  @api {get} /category/getcategory Category Detail
  @apiName getcategory
  @apiGroup Category
  @apiVersion 0.1.0

  *@apiParam {String} catId Id Of Category

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
      "message": "Category Not Found"
    *}
*/
let getCategoryMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, categoryCtr.getCategory]
categoryRouter.get('/getcategory', getCategoryMiddleware)

/**
  @api {get} /category/list Category List
  @apiName categorylist
  @apiGroup Category
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {Number} page Page Number, start with 0, to show next set of Category start

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "category":
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
      "message": "Category Not Found"
    *}
*/
let listMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedUser, categoryCtr.list]
categoryRouter.get('/list', listMiddleware)

module.exports = categoryRouter
