// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let menuCtr = require('./menuController.js')
let menuRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /menu/create Menu Create
  @apiName menucreate
  @apiGroup Menu
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {form-data} Header-Example
  *{
    "Content-Type": multipart/form-data
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} name Name Of Menu
  *@apiParam {Files} image Image Of Menu
  *@apiParam {Number} price Price Of Menu
  *@apiParam {String} categoryId Id Of Cateogry

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
      "message": "Menu Not Created"
    *}
*/
let createMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, menuCtr.create]
menuRouter.post('/create', createMiddleware)

/**
  @api {post} /menu/edit Menu Edit
  @apiName menuedit
  @apiGroup Menu
  @apiVersion 0.1.0

  *@apiParam {String} name Name Of Menu
  *@apiParam {Files} image Image Of Menu
  *@apiParam {Number} price Price Of Menu
  *@apiParam {String} categoryId Id Of Cateogry

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
      "message": "Menu Not Found"
    *}
*/
let editMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, menuCtr.edit]
menuRouter.post('/edit', editMiddleware)

/**
  @api {post} /menu/delete Menu Delete
  @apiName menudelete
  @apiGroup Menu
  @apiVersion 0.1.0

  *@apiParam {String} catId Id Of Menu

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
      "message": "Menu Not Found"
    *}
*/
let deleteMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, menuCtr.delete]
menuRouter.post('/delete', deleteMiddleware)

/**
  @api {get} /menu/getmenu Menu Detail
  @apiName getmenu
  @apiGroup Menu
  @apiVersion 0.1.0

  *@apiParam {String} catId Id Of Menu

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "menu": menu,
    "status": 200,
    "message": "SUCCESS"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Menu Not Found"
    *}
*/
let getMenuMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, menuCtr.getMenu]
menuRouter.get('/getmenu', getMenuMiddleware)

/**
  @api {get} /menu/list Menu List
  @apiName menulist
  @apiGroup Menu
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} menuId Id Of Cateogry
  *@apiParam {String} userId Id Of Food Truck
  *@apiParam {Number} page Page Number, start with 0, to show next set of Menu start

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "menu":
      {
        "_id": _id,
        "name": name,
        "image": image,
        "price": price,
        "createdAt": createdAt,
        "categoryId":
          {
            "_id": _id,
            "name": name,
            "createdAt": createdAt,
          }
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Menu Not Found"
    *}
*/
let listMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedUser, menuCtr.list]
menuRouter.get('/list', listMiddleware)

/**
  @api {get} /menu/search Menu Search
  @apiName menusearch
  @apiGroup Menu
  @apiVersion 0.1.0

  *@apiHeader {String} x-auth-token User's authorization token that you received at the time of registration or login
  *@apiHeaderExample {json} Header-Example
  *{
    "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiI1OGY1ZTc2MjBlZTc1OTFkZDI1YWM1NTIiLCJlbWFpbCI6InJkbUBleGFtcGxlLmNvbSJ9.cac9VaPxh9mCUp7DH3J05d8lzlTpOJcnPKoZhwUz9xk"
  *}

  *@apiParam {String} name Name Of Menu
  *@apiParam {String} menuId Id Of Cateogry
  *@apiParam {String} userId Id Of Food Truck
  *@apiParam {Number} page Page Number, start with 0, to show next set of Menu start

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "menu":
      {
        "_id": _id,
        "name": name,
        "image": image,
        "price": price,
        "createdAt": createdAt,
        "categoryId":
          {
            "_id": _id,
            "name": name,
            "createdAt": createdAt,
          }
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Menu Not Found"
    *}
*/
let searchMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedFoodTruck, menuCtr.search]
menuRouter.get('/search', searchMiddleware)

module.exports = menuRouter
