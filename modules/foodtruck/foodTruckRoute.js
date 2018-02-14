// Dependencies
let express = require('express')
let multipart = require('connect-multiparty')
let auth = require('../../helper/auth')
let foodTruckCtr = require('./foodTruckController.js')

let foodTruckRouter = express.Router()
let multipartMiddleware = multipart()

/**
  @api {post} /foodtruck/login Food Truck Login
  @apiName foodtrucklogin
  @apiGroup Food Truck
  @apiVersion 0.1.0

  *@apiParam {String} email Email Address Of Food Truck
  *@apiParam {String} password Password To Corresponding Account

  *@apiSuccessExample Success-Response
  *HTTP/1.1 1 ok
  *{
    "status": 200,
    "message": "SUCCESS",
    "foodtruck":
      {
        "_id": _id,
        "type": type,
        "email": email,
        "password": password,
        "truckName": truckName,
        "secretToken": secretToken
      }
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "Food Truck Not Found"
    *}
*/
let loginMiddleware = [multipartMiddleware, foodTruckCtr.login]
foodTruckRouter.post('/login', loginMiddleware)

/**
  @api {post} /foodtruck/create Food Truck Create
  @apiName foodtruckcreate
  @apiGroup Food Truck
  @apiVersion 0.1.0

  *@apiParam {String} type Type Of Food Truck
  *@apiParam {String} email Email Address Of Food Truck
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
      "message": "Food Truck with this email is already registered."
    *}
*/
let createMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, foodTruckCtr.create]
foodTruckRouter.post('/create', createMiddleware)

/**
  @api {post} /foodtruck/edit Food Truck Edit
  @apiName foodtruckedit
  @apiGroup Food Truck
  @apiVersion 0.1.0

  *@apiParam {String} type Type Of Food Truck
  *@apiParam {String} email Email Address Of Food Truck
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
      "message": "Food Truck with this email is already registered."
    *}
*/
let editMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, foodTruckCtr.edit]
foodTruckRouter.post('/edit', editMiddleware)

/**
  @api {post} /foodtruck/delete Food Truck Delete
  @apiName foodtruckdelete
  @apiGroup Food Truck
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Food Truck

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
let deleteMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, foodTruckCtr.delete]
foodTruckRouter.post('/delete', deleteMiddleware)

/**
  @api {get} /foodtruck/getuser Food Truck User Detail
  @apiName foodtruckgetuser
  @apiGroup Food Truck
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Food Truck

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
      "message": "No Record Found"
    *}
*/
let getUserMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, foodTruckCtr.getUser]
foodTruckRouter.get('/getuser', getUserMiddleware)

/**
  @api {post} /foodtruck/status Food Truck Status
  @apiName foodtruckstatus
  @apiGroup Food Truck
  @apiVersion 0.1.0

  *@apiParam {String} userId Id Of Food Truck
  *@apiParam {String} status Status Of Food Truck

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
      "message": "Food Truck with this email is already registered."
    *}
*/
let statusMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, foodTruckCtr.status]
foodTruckRouter.post('/status', statusMiddleware)

/**
  @api {get} /foodtruck/list Food Truck List
  @apiName foodtrucklist
  @apiGroup Food Truck
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
    "result": result,
    "message": "SUCCESS"
  *}

  *@apiErrorExample Failure-Response
    *HTTP/1.1 0 ok
    *{
      "status": 400,
      "message": "No Record Found"
    *}
*/
let listMiddleware = [multipartMiddleware, auth.checkToken, auth.isAuthenticatedAdmin, foodTruckCtr.list]
foodTruckRouter.get('/list', listMiddleware)

module.exports = foodTruckRouter
