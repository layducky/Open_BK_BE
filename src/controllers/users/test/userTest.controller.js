const { sequelize, UserTest, Test, Submission } = require('../../../sequelize'); 
const UserTestController = {
    
    async getByID (req, res) {        
        const t = await sequelize.transaction(); 
        try {
            const { testID } = req.params;
            const userID = req.user.userID;

            const userTest = await UserTest.findOne({
                where: { userID, testID },
                attributes: ['status', 'maxAttempts', 'userTestID'],
                transaction: t,
            });

            if (!userTest) {
                await t.rollback();
                return res.status(404).json({ message: 'UserTest not found' });
            }

            const [test, submissions] = await Promise.all([
                Test.findOne({
                    where: { testID },
                    attributes: ['duration', 'numQuests'],
                }),
                Submission.findAll({
                    where: { userTestID: userTest.userTestID },
                }),
            ]);

            await t.commit();

            return res.status(200).json({
                status: userTest.status,
                maxAttempts: userTest.maxAttempts,
                duration: test ? test.duration : null,
                numQuests: test ? test.numQuests : null,
                submissions: submissions.map(s => s.toJSON()),
            });

        } catch(err) {
            res.status(500).json({ message: 'Internal server error', error: err.message });
        };
    }
};

module.exports = UserTestController;