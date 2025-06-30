const { Unit, Course, Test } = require('../../sequelize');
const { generateUnitID } = require('../../utils/generateID');
const {filterNull, checkNull} = require('../..//utils/checkNull');

const UnitController = {
    async createUnit(req, res) {
        try {
            const { courseID } = req.params;
            const { unitName, description } = req.body;

            const course = await Course.findByPk(courseID);
            if (!course) return res.status(404).json({ error: 'Course not found' });

            const unitID = generateUnitID(courseID);
            const maxOrder = await Unit.max('numericalOrder', {
                where: { courseID }
            });
            const numericalOrder = (maxOrder || 0) + 1;

            const fieldsToCreate = filterNull({
                unitID,
                courseID,
                unitName,
                description,
                numericalOrder,
            });
            await Unit.create(fieldsToCreate);
            return res.status(201).json({ unitID, message: 'Created unit successfully' });
        } catch (error) {
            return res.status(500).json({ error: error.name });
        }
    },
  
    async getAllUnits(req, res) {
        try {
            const { courseID } = req.params;

            const course = await Course.findByPk(courseID);
            if (!course) return res.status(404).json({ error: 'Course not found' });

            const units = await Unit.findAll({
                where: { courseID },
                include: [
                    {
                        model: Test,
                        as: 'unit_tests',
                        attributes: ['testID', 'testName', 'numQuests', 'duration'],
                    },
                ],
            });
            return res.status(200).json(units);

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
  
    async getUnitByID(req, res) {
        try {
            const { unitID } = req.params;
            
            const course = await Course.findByPk(courseID);
            if (!course) return res.status(404).json({ error: 'Course not found' });

            const unit = await Unit.findOne({
                where: {
                    unitID
                }
            });
            if (!unit) return res.status(404).json({ error: 'Unit not found' });
            res.status(200).json(unit);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
  
    async updateUnit(req, res) {
        try {
            const { unitID } = req.params;
            const { unitName, description } = req.body;
            
            const course = await Course.findByPk(courseID);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            
            const updated = await Unit.update(
                { unitName, description },
                { where: { unitID } }
            );
            if (!updated[0]) return res.status(404).json({ error: 'Unit not found' });
            return res.status(200).json({ message: 'Unit updated successfully' });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
  
    async deleteUnit(req, res) {
        try {
            const { unitID } = req.params;
            const deleted = await Unit.destroy({
                where: {
                    unitID
                }
            });
            if (!deleted) return res.status(404).json({ error: 'Unit not found' });
            return res.status(200).json({ message: 'Unit deleted successfully' });

        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
};
  
module.exports = UnitController;