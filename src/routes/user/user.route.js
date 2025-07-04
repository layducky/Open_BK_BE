const express = require('express')
const router = express.Router()
const { userUpdateValidations } = require('../../controllers/users/userDTO')  // Validation middleware

const {
   getUserInfo,
   getAllUsers,
   createCollab,
   deleteUser,
   deleteAllUsers,
   updateUserInfo,
   updateCollabPrivilege,
   updateUserPassword,
   getAllCourseByUser,
} = require('../../controllers/users/user.controller')
const { verifyJWT } = require('../../middleware/verifyJWT')

router.delete('/:userID', deleteUser)
router.delete('/', deleteAllUsers)

router.post('/', createCollab)


router.get('/all', getAllUsers)
router.get('/course', getAllCourseByUser)
router.get('/:userID', getUserInfo)

router.patch('/info', userUpdateValidations, updateUserInfo)
router.patch('info/password', updateUserPassword)

router.patch('/collab/:id', userUpdateValidations, updateCollabPrivilege)


module.exports = router