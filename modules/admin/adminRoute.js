// Dependencies
let express = require('express')
let auth = require('../../helper/auth')
let multipart = require('connect-multiparty')
let adminCtr = require('./adminController.js')

let adminRouter = express.Router()
let multipartMiddleware = multipart()

let loginMiddleware = [multipartMiddleware, adminCtr.login]
adminRouter.post('/login', loginMiddleware)

let createMiddleware = [multipartMiddleware, auth.isAuthenticatedAdmin, adminCtr.create]
adminRouter.post('/create', createMiddleware)

let editMiddleware = [multipartMiddleware, auth.isAuthenticatedAdmin, adminCtr.edit]
adminRouter.post('/edit', editMiddleware)

let deleteMiddleware = [multipartMiddleware, auth.isAuthenticatedAdmin, adminCtr.delete]
adminRouter.post('/delete', deleteMiddleware)

let getUserMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, adminCtr.getUser]
adminRouter.get('/getuser', getUserMiddleware)

let listMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, adminCtr.list]
adminRouter.get('/list', listMiddleware)

let getSettingMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, adminCtr.getSetting]
adminRouter.get('/getsetting', getSettingMiddleware)

let saveSettingMiddleware = [auth.checkToken, auth.isAuthenticatedAdmin, adminCtr.saveSetting]
adminRouter.post('/savesetting', saveSettingMiddleware)

module.exports = adminRouter
