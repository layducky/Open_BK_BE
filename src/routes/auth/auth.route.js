const express = require('express')
const authRouter = express.Router()
const { userCreateValidations, userLoginValidation, userGoogleValidation } = require('../../controllers/users/userDTO')
const { signUp, logIn, logOut } = require('../../controllers/auth/auth.controller')
const { oAuth2 } = require('../../controllers/auth/oAuth.controller')

authRouter.post('/signup', userCreateValidations, signUp)

authRouter.post('/login', userLoginValidation, logIn)

authRouter.post('/oauth2', userGoogleValidation, oAuth2)

authRouter.post('/logout', logOut)
module.exports = authRouter
