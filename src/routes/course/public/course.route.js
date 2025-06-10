const express = require('express');
const CourseController = require('../../../controllers/course/course.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.get('/', CourseController.getAllCourses);
router.get('/:courseID', CourseController.getCourseByID);

router.use(verifyJWT(["ADMIN"]));
router.put('/:courseID', CourseController.updateCourse);
router.delete('/:courseID', CourseController.deleteCourse);
router.delete('/', CourseController.deleteAllCourses);

module.exports = router;
