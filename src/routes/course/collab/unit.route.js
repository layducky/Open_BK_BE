const express = require('express');
const UnitController = require('../../../controllers/course/unit.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');
const checkCourseAccess = require('../../../middleware/checkCourseAccess');

const router = express.Router();

router.get(`/all/:courseID/`, verifyJWT(['LEARNER', 'COLLAB', 'ADMIN']), checkCourseAccess, UnitController.getAllUnits);
router.get(`/id/:unitID`, verifyJWT(['LEARNER', 'COLLAB', 'ADMIN']), checkCourseAccess, UnitController.getUnitByID);
router.use(verifyJWT(['COLLAB', 'ADMIN']));
router.post(`/:courseID/`, UnitController.createUnit);
router.put(`/:unitID`, UnitController.updateUnit);
router.delete(`/:unitID`, UnitController.deleteUnit);

module.exports = router;
