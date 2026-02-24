const express = require('express');
const CourseController = require('../../../controllers/course/course.controller');
const UnitController = require('../../../controllers/course/unit.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.get('/', CourseController.getAllCourses);
router.get('/categories', CourseController.getCategories);
router.get('/:courseID/units', UnitController.getAllUnits);
router.get('/:courseID', CourseController.getCourseByID);

router.use(verifyJWT(["ADMIN"]));
router.put('/:courseID', CourseController.updateCourse);
router.delete('/:courseID', CourseController.deleteCourse);
router.delete('/', CourseController.deleteAllCourses);

module.exports = router;
