const { body } = require("express-validator");

const userCreateValidations = [
   body("username").exists().isString(),
   body("email").exists().isEmail(),
   body("password").exists().isString(),
]

const userUpdateValidations = [
   body("username").isString().notEmpty(),
   body("email").isEmail().notEmpty(),
   body("password").isString().notEmpty(),
]

const userLoginValidation = [
   body("email").exists().isEmail(),
   body("password").exists().isString(),
]

module.exports = {userCreateValidations, userUpdateValidations, userLoginValidation}