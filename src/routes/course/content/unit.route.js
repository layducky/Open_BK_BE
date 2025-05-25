const express = require('express');
const UnitController = require('../../../controllers/course/unit.controller');

const router = express.Router();
const basepath = '/';

router.post(`${basepath}:courseID/`, UnitController.createUnit); // Create a new unit
router.get(`${basepath}all/:courseID/`, UnitController.getAllUnits); // Get all units
router.get(`${basepath}id/:unitID`, UnitController.getUnitByID); // Get a single unit by ID
router.put(`${basepath}:unitID`, UnitController.updateUnit); // Update a unit
router.delete(`${basepath}:unitID`, UnitController.deleteUnit); // Delete a unit

module.exports = router;
