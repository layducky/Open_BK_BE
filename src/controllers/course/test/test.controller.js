const { Test, Unit, Question, UserTest, Participate } = require('../../../sequelize');
const { generateTestID } = require('../../../utils/generateID');
const { sequelize } = require('../../../sequelize');

const TestController = {
    async createTest(req, res) {
        const t = await sequelize.transaction(); 
        try {
            const { unitID } = req.params;
            const { testName, description, duration } = req.body;

            if (!testName || !description || !duration) {
                await t.rollback();
                return res.status(400).json({ message: 'Bad request, some fields are missing' });
            }
            //Check unit exists
            const unit = await Unit.findByPk(unitID, { transaction: t });
            if (!unit){
                await t.rollback();
                return res.status(404).json({ error: 'Unit not found' });
            }
            //Create new numericalOrder for the test
            const maxOrder = await Test.max('numericalOrder', {
                where: { unitID },
                transaction: t,
            });
            const numericalOrder = (maxOrder || 0) + 1;            
            const testID = generateTestID();
            //Create NEW TEST
            const test = await Test.create({
                testID,
                unitID,
                testName,
                numericalOrder,
                description,
                duration
            }, {transaction: t});
            
            const courseID = unit.courseID;
            const exist = await Participate.findOne({
                where: { learnerID: req.user.userID, courseID },
                transaction: t,
            });
            if (!exist) {
                await Participate.create({
                    learnerID: req.user.userID,
                    courseID,
                }, { transaction: t });
            }

            const learners = await Participate.findAll({
                where: { courseID },
                attributes: ['learnerID'],
                transaction: t,
            });

            if (learners.length > 0) {
                const userTests = learners.map(l => ({
                    userID: l.learnerID,
                    testID,
                }));
                await UserTest.bulkCreate(userTests, {
                    transaction: t,
                    ignoreDuplicates: true,
                });
            }

            await t.commit();
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
                    model: Question,
                    as: 'test_questions',
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