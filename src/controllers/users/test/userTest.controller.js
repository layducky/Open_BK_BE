const { sequelize, UserTest, Test, Submission, Unit } = require('../../../sequelize'); 
const UserTestController = {
    
    async getByID (req, res) {        
        const t = await sequelize.transaction(); 
        try {
            const { testID } = req.params;
            const userID = req.user.userID;

            const userTest = await UserTest.findOne({
                where: { userID, testID },
                attributes: ['status', 'score', 'userTestID'],
                transaction: t,
            });

            if (!userTest) {
                const test = await Test.findByPk(testID, {
                    include: [{ model: Unit, as: 'unit_tests', attributes: ['courseID'] }],
                    transaction: t,
                });
                const courseID = test?.unit_tests?.courseID ?? null;
                await t.rollback();
                return res.status(403).json({
                    message: 'You must enroll in this course to access this test',
                    courseID,
                });
            }

            const [test, submissions] = await Promise.all([
                Test.findOne({
                    where: { testID },
                    attributes: ['testName', 'maxAttempts','numericalOrder', 'duration', 'numQuests'],
                }),
                Submission.findAll({
                    where: { userTestID: userTest.userTestID },
                    attributes: { exclude: ['userTestID', 'testID', 'studentID'] },
                }),
            ]);

            const lastSubmissionID = submissions.length > 0
                ? submissions[submissions.length - 1].submissionID
                : null;

            await t.commit();

            return res.status(200).json({
                userTestID: userTest.userTestID,
                testName: test ? test.testName : null,
                numericalOrder: test ? test.numericalOrder : null,
                status: userTest.status,
                maxAttempts: test ? test.maxAttempts : null,
                totalScore: userTest.score,
                duration: test ? test.duration : null,
                numQuests: test ? test.numQuests : null,
                lastSubmissionID,
                submissions: submissions.map(s => s.toJSON()),
            });

        } catch(err) {
            res.status(500).json({ message: 'Internal server error', error: err.message });
        };
    }
};

module.exports = UserTestController;