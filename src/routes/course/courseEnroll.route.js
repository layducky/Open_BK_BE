const express = require('express')
const router = express.Router()
const { verifyJWT } = require('../../middleware/verifyJWT');
const CourseEnroll = require('../../controllers/course/courseEnroll.controller');

router.use(verifyJWT(["LEARNER", "COLLAB", "ADMIN"]))
router.get('/', CourseEnroll.getEnrolledCourses)
router.post('/:courseID', CourseEnroll.enrollCourse)
router.delete('/:courseID', CourseEnroll.deleteEnrolledCoures)

module.exports = router