const express = require('express')
const authRouter = express.Router()
const { userCreateValidations, userLoginValidation } = require('../../controllers/users/userDTO')
const { signUp, logIn, logOut } = require('../../controllers/auth/auth.controller')

authRouter.post('/signup', userCreateValidations, signUp)

authRouter.post('/login', userLoginValidation, logIn)

authRouter.post('/logout', logOut)
module.exports = authRouter
