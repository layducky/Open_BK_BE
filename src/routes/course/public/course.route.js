const express = require('express');
const CourseController = require('../../../controllers/course/course.controller');
const UnitController = require('../../../controllers/course/unit.controller');
const DocumentController = require('../../../controllers/course/document/document.controller');
const VideoController = require('../../../controllers/course/video/video.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.get('/', CourseController.getAllCourses);
router.get('/categories', CourseController.getCategories);
router.get('/document/:documentID/download', DocumentController.getDownloadUrl);
router.get('/video/:videoID/download', VideoController.getDownloadUrl);
router.get('/video/:videoID/view', VideoController.getViewUrl);
router.get('/:courseID/units', UnitController.getAllUnits);
router.get('/:courseID', CourseController.getCourseByID);

router.use(verifyJWT(["ADMIN"]));
router.put('/:courseID', CourseController.updateCourse);
router.delete('/:courseID', CourseController.deleteCourse);
router.delete('/', CourseController.deleteAllCourses);

module.exports = router;
