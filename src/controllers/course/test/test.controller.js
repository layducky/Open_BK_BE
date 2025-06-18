const { Test, Unit, Submission } = require('../../../sequelize');
const { generateTestID } = require('../../../utils/generateID');

const TestController = {
    async createTest(req, res) {
        try {
            const { unitID } = req.params;
            const { testName, description, duration } = req.body;

            if (!testName || !description || !duration) {
                return res.status(400).json({ message: 'Bad request, some fields are missing' });
            }
            
            const unit = await Unit.findByPk(unitID);
            if (!unit) return res.status(404).json({ error: 'Unit not found' });

            const maxOrder = await Test.max('numericalOrder', {
                where: { unitID }
            });
            const numericalOrder = (maxOrder || 0) + 1;
            
            const testID = generateTestID();
            const test = await Test.create({
                testID,
                unitID,
                testName,
                numericalOrder,
                description,
                duration
            });

            res.status(201).json({ testID: test.testID, message: 'Created test successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getTestByID(req, res) {
        try {
            const { testID } = req.params;

            const test = await Test.findByPk(testID,  {
                include: [{
                    model: Submission,
                    as: 'test_submissions',
                    required: false
                }]
            });
            if (!test) return res.status(404).json({ error: 'Test not found' });
            res.status(200).json(test);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async getAllTests(req, res) {
        try {
            const { unitID } = req.params;
            const tests = await Test.findAll({ where: { unitID } });
            res.status(200).json(tests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async updateTest(req, res) {
        try {
            const { testID } = req.params;
            const { testName, description, duration } = req.body;

            const test = await Test.findByPk(testID);
            if (!test) return res.status(404).json({ error: 'Test not found' });

            await test.update({ testName, description, duration });
            res.status(200).json({ message: 'Updated test successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async deleteTest(req, res) {
        try {
            const { testID } = req.params;

            const test = await Test.findByPk(testID);
            if (!test) return res.status(404).json({ error: 'Test not found' });

            await test.destroy();
            res.status(200).json({ message: 'Deleted test successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = TestController