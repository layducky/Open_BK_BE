const express = require('express');
const UnitController = require('../../../controllers/course/unit.controller');
const { verifyJWT } = require('../../../middleware/verifyJWT');

const router = express.Router();

router.get(`/all/:courseID/`, UnitController.getAllUnits);
router.get(`/id/:unitID`, UnitController.getUnitByID);
router.use(verifyJWT(["COLLAB", "ADMIN"]))
router.post(`/:courseID/`, UnitController.createUnit);
router.put(`/:unitID`, UnitController.updateUnit);
router.delete(`/:unitID`, UnitController.deleteUnit);

module.exports = router;
