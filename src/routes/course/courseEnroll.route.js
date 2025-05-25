const express = require('express')
const router = express.Router()
const verifyJWT = require('../../middleware/verifyJWT');
const CourseEnroll = require('../../controllers/course/courseEnroll.controller');

router.use(verifyJWT)
router.get('/:learnerID', CourseEnroll.getEnrolledCourses)
router.post('/', CourseEnroll.enrollCourse)
router.delete('/:learnerID/:courseID', CourseEnroll.deleteEnrolledCoures)

module.exports = router