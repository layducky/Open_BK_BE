const express = require('express')
const router = express.Router()
const CourseCollab = require('../../../controllers/course/courseCollab.controller');

router.get('/', CourseCollab.getAllOwnedCourses)
router.get('/learners/:courseID', CourseCollab.getAllLearners)
router.post('/', CourseCollab.createCourse);
router.put('/:courseID', CourseCollab.updateCourse);
router.delete('/:courseID', CourseCollab.deleteCourse)
// router.delete('/:courseID', CourseCollab.deleteLearnerFromCourse)

module.exports = router