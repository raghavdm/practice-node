// Dependencies
let express = require('express')
let auth = require('../../helper/auth')
let userCtr = require('./userController.js')
let userRouter = express.Router()

let createMiddleware = [userCtr.create]
userRouter.post('/create', createMiddleware)

let loginMiddleware = [userCtr.login]
userRouter.post('/login', loginMiddleware)

let profileMiddleware = [auth.checkToken, auth.isAuthenticatedUser, userCtr.profile]
userRouter.post('/profile', profileMiddleware)

module.exports = userRouter