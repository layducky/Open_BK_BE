const { Submission, UserTest, Question, Test, QuesAns, sequelize } = require('../../../sequelize');
const { filterNull, checkNull } = require('../../../utils/checkNull');

const SubmitController = {
    async createSubmit(req, res) {
    const t = await sequelize.transaction();
        try {
            const { userTestID } = req.params;
            const { userID } = req.user;

            const userTest = await UserTest.findOne({
                where: { userTestID },
                attributes: ['testID', 'userTestID'],
                transaction: t,
            });

            if (!userTest) {
                await t.rollback();
                return res.status(404).json({ message: 'UserTest not found' });
            }

            await userTest.update({ status: 'continue' }, { transaction: t });

            const { testID } = userTest;

            const latestSubmission = await Submission.findOne({
                where: { userTestID },
                order: [['numericalOrder', 'DESC']],
                transaction: t,
            });

            if (latestSubmission?.status === 'pending') {
                await t.rollback();
                return res.status(400).json({
                    message: 'You already have a pending submission. Please finish it before starting a new one.',
                });
            }

            const maxOrder = await Submission.max('numericalOrder', {
                where: { userTestID },
                transaction: t,
            });

            const numericalOrder = (maxOrder || 0) + 1;

            const fieldsToCreate = {
                userTestID,
                testID,
                studentID: userID,
                numericalOrder,
            };

            const submit = await Submission.create(fieldsToCreate, { transaction: t });

            if (!submit) {
                await t.rollback();
                return res.status(500).json({ message: 'Failed to create submission' });
            }


            await t.commit();

            return res.status(201).json({
                submissionID: submit.submissionID,
                duration: submit.duration,
                message: 'Examination start now!',
            });

        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    },

    async updateSubmit(req, res) {
        const t = await sequelize.transaction();
        try {
            const { submissionID } = req.params;
            const { status, submission } = req.body;

            const submissionRecord = await Submission.findByPk(submissionID, {
                include: {
                    model: Test,
                    as: 'test_submissions',
                    attributes: ['numQuests'],
                },
                transaction: t
            });
            if (!submissionRecord) {
                await t.rollback();
                return res.status(404).json({ message: 'Submission not found' });
            }

            if (['submitted', 'graded'].includes(submissionRecord.status)) {
                await t.rollback();
                return res.status(400).json({ message: 'The test is completed and cannot be redone.' });
            }

            if (!submission || !Array.isArray(submission) || !submission.every(item => item.questionID && item.selectedAns)) {
                await t.rollback();
                return res.status(400).json({ message: 'Invalid submission data' });
            }

            const now = Date.now();
            const deadline = new Date(submissionRecord.createdAt).getTime() + submissionRecord.duration * 60 * 1000;
            if (deadline < now) {
                await t.rollback();
                return res.status(403).json({ error: 'Deadline exceeded' });
            }

            const quesAnsPromises = submission.map(async item => {
                const question = await Question.findOne({
                    where: {
                        questionID: item.questionID,
                        testID: submissionRecord.testID,
                    },
                    transaction: t,
                });
                if (!question) {
                    throw new Error(`Invalid questionID: ${item.questionID}`);
                }

                const isCorrect = question?.correctAns === item.selectedAns;
                await QuesAns.upsert({
                    submissionID,
                    questionID: item.questionID,
                    selectedAns: item.selectedAns,
                    isCorrect,
                }, { transaction: t });

                return isCorrect ? 1 : 0;
            });
            const AnsList = await Promise.all(quesAnsPromises);
            const numRightAns = AnsList.reduce((sum, correct) => sum + correct, 0);
            const totalScore = (numRightAns / submissionRecord.test_submissions.numQuests) * 100 || 0;
            

            if (status === "submitted") {
                const submittedAt = new Date();
                const timeTaken = (submittedAt - new Date(submissionRecord.createdAt)) / 60000;

                await submissionRecord.update({
                    status,
                    submittedAt,
                    timeTaken,
                    numRightAns,
                    totalScore,
                }, { transaction: t });

                await UserTest.update(
                    { status: 'allow' },
                    { where: { userTestID: submissionRecord.userTestID }, transaction: t }
                );
            }

            await t.commit();
            return res.status(200).json({ message: 'Submission updated successfully!' });

        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    },


    async getAllSubmissionOnTest (req, res) {
        try {
            const { userTestID } = req.params;

            const test = await UserTest.findOne({ where: { userTestID } });
            if (!test) {
                return res.status(404).json({ message: 'Test not found' });
            }

            const submissions = await Submission.findAll({
                where: { userTestID },
                attributes: { exclude: ['userTestID', 'studentID', 'testID', 'createdAt', 'updatedAt'] }
            });
            if (!submissions.length) {
                return res.status(404).json({ message: 'No submissions found for this test' });
            }

            return res.status(200).json({ submissions });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteSubmitHistory(req, res) {
        const t = await sequelize.transaction();
        try {
            const { submissionID } = req.params;

            const submission = await Submission.findByPk(submissionID, { transaction: t });
            if (!submission) {
                await t.rollback();
                return res.status(404).json({ message: 'Submission not found' });
            }

            await QuesAns.destroy({ where: { submissionID }, transaction: t });
            await submission.destroy({ transaction: t });

            await t.commit();
            return res.status(200).json({ message: 'Submission history deleted successfully!' });
        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    },

    async deleteAllSubmitHistory(req, res) {
        const t = await sequelize.transaction();
        try {
            const { userTestID } = req.params;

            const submissions = await Submission.findAll({ where: { userTestID }, transaction: t });
            if (!submissions.length) {
                await t.rollback();
                return res.status(404).json({ message: 'No submissions found for this test' });
            }

            const submissionIDs = submissions.map(sub => sub.submissionID);

            await QuesAns.destroy({ where: { submissionID: submissionIDs }, transaction: t });
            await Submission.destroy({ where: { userTestID }, transaction: t });

            await t.commit();
            return res.status(200).json({ message: 'All submission histories deleted successfully!' });
        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = SubmitController;