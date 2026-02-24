const { Submission, UserTest, Question, Test, QuesAns, sequelize } = require('../../../sequelize');

const SubmitController = {
    async createSubmit(req, res) {
        const t = await sequelize.transaction();
        try {
            const { userTestID } = req.params;
            const { userID } = req.user;

            const userTest = await UserTest.findOne({
                where: { userTestID },
                include: [{ model: Test, as: 'user_tests', attributes: ['duration'] }],
                transaction: t,
            });

            if (!userTest) {
                await t.rollback();
                return res.status(404).json({ message: 'UserTest not found' });
            }

            const latestSubmission = await Submission.findOne({
                where: { userTestID },
                order: [['numericalOrder', 'DESC']],
                transaction: t,
            });

            if (latestSubmission?.status === 'ongoing') {
                await t.rollback();
                return res.status(409).json({
                    code: 'ONGOING_SUBMISSION',
                    message: 'You have an ongoing submission. End it to start a new one.',
                    submissionID: latestSubmission.submissionID,
                });
            }

            const maxOrder = await Submission.max('numericalOrder', {
                where: { userTestID },
                transaction: t,
            });

            const numericalOrder = (maxOrder || 0) + 1;

            const fieldsToCreate = {
                userTestID,
                testID: userTest.testID,
                studentID: userID,
                numericalOrder,
            };

            const submit = await Submission.create(fieldsToCreate, { transaction: t });

            if (!submit) {
                await t.rollback();
                return res.status(500).json({ message: 'Failed to create submission' });
            }

            await userTest.update({ status: 'continue' }, { transaction: t });
            await t.commit();

            const duration = userTest.user_tests?.duration ?? 0;
            const startedAt = submit.createdAt ? new Date(submit.createdAt).toISOString() : new Date().toISOString();
            return res.status(201).json({
                submissionID: submit.submissionID,
                duration,
                startedAt,
                serverTime: Date.now(),
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
                    attributes: ['numQuests', 'duration'],
                },
                transaction: t,
            });
            if (!submissionRecord) {
                await t.rollback();
                return res.status(404).json({ message: 'Submission not found' });
            }
            if (submissionRecord.studentID !== req.user.userID) {
                await t.rollback();
                return res.status(403).json({ message: 'Forbidden' });
            }

            if (['submitted', 'graded'].includes(submissionRecord.status)) {
                await t.rollback();
                return res.status(400).json({ message: 'The test is completed and cannot be redone.' });
            }

            if (!submission || !Array.isArray(submission)) {
                await t.rollback();
                return res.status(400).json({ message: 'Invalid submission data' });
            }
            const validItems = submission.filter(item => item && item.questionID && (item.selectedAns !== undefined || item.selectedAns === 'NULL'));
            if (validItems.length === 0 && status === 'submitted') {
                await t.rollback();
                return res.status(400).json({ message: 'At least one answer required to submit' });
            }

            const test = submissionRecord.test_submissions;
            const durationMinutes = test?.duration ?? 0;
            const now = Date.now();
            const deadline = new Date(submissionRecord.createdAt).getTime() + durationMinutes * 60 * 1000;
            if (deadline < now) {
                await t.rollback();
                return res.status(403).json({ error: 'Deadline exceeded' });
            }

            const itemsToProcess = validItems.length > 0 ? validItems : submission.filter(i => i?.questionID);
            const quesAnsPromises = itemsToProcess.map(async item => {
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
            const numQuests = test?.numQuests ?? 1;
            const totalScore = (numRightAns / numQuests) * 100 || 0;
            let submittedAt = null;
            let timeTaken = null;

            if (status === "submitted") {
                submittedAt = new Date();
                timeTaken = (submittedAt - new Date(submissionRecord.createdAt)) / 60000;

                await submissionRecord.update({
                    status: 'submitted',
                    submittedAt,
                    timeTaken,
                    numRightAns,
                    totalScore,
                }, { transaction: t });

                await UserTest.update(
                    { status: 'allow', score: totalScore },
                    { where: { userTestID: submissionRecord.userTestID }, transaction: t }
                );
            }

            await t.commit();
            const payload = { message: 'Submission updated successfully!' };
            if (status === 'submitted' && submittedAt) {
                payload.totalScore = totalScore;
                payload.numRightAns = numRightAns;
                payload.numQuests = numQuests;
                payload.timeTaken = timeTaken;
                payload.submittedAt = submittedAt.toISOString();
            }
            return res.status(200).json(payload);

        } catch (error) {
            await t.rollback();
            res.status(500).json({ error: error.message });
        }
    },


    async forceEndAndCreate(req, res) {
        const t = await sequelize.transaction();
        try {
            const { userTestID } = req.params;
            const userID = req.user.userID;

            const userTest = await UserTest.findOne({
                where: { userTestID },
                include: [{ model: Test, as: 'user_tests', attributes: ['duration', 'numQuests', 'testID'] }],
                transaction: t,
            });
            if (!userTest) {
                await t.rollback();
                return res.status(404).json({ message: 'UserTest not found' });
            }

            const ongoingSubmission = await Submission.findOne({
                where: { userTestID },
                order: [['numericalOrder', 'DESC']],
                transaction: t,
            });

            if (!ongoingSubmission || ongoingSubmission.status !== 'ongoing') {
                await t.rollback();
                return res.status(400).json({ message: 'No ongoing submission to end' });
            }
            if (ongoingSubmission.studentID !== userID) {
                await t.rollback();
                return res.status(403).json({ message: 'Forbidden' });
            }

            const quesAnsList = await QuesAns.findAll({
                where: { submissionID: ongoingSubmission.submissionID },
                attributes: ['isCorrect'],
                transaction: t,
            });

            const numRightAns = quesAnsList.filter(qa => qa.isCorrect).length;
            const numQuests = userTest.user_tests?.numQuests ?? 1;
            const totalScore = numQuests > 0 ? (numRightAns / numQuests) * 100 : 0;
            const submittedAt = new Date();
            const timeTaken = (submittedAt - new Date(ongoingSubmission.createdAt)) / 60000;

            await ongoingSubmission.update({
                status: 'submitted',
                submittedAt,
                timeTaken,
                numRightAns,
                totalScore,
            }, { transaction: t });

            const maxOrder = await Submission.max('numericalOrder', { where: { userTestID }, transaction: t });
            const numericalOrder = (maxOrder || 0) + 1;
            const newSubmission = await Submission.create({
                userTestID,
                testID: userTest.testID,
                studentID: userID,
                numericalOrder,
            }, { transaction: t });

            await UserTest.update(
                { status: 'continue', lastSubmissionID: newSubmission.submissionID, score: totalScore },
                { where: { userTestID }, transaction: t }
            );

            await t.commit();

            const duration = userTest.user_tests?.duration ?? 0;
            const startedAt = newSubmission.createdAt ? new Date(newSubmission.createdAt).toISOString() : new Date().toISOString();
            return res.status(201).json({
                submissionID: newSubmission.submissionID,
                duration,
                startedAt,
                serverTime: Date.now(),
                message: 'Previous attempt saved. New attempt started.',
            });
        } catch (error) {
            await t.rollback();
            return res.status(500).json({ error: error.message });
        }
    },

    async getOngoingAnswers(req, res) {
        try {
            const { submissionID } = req.params;
            const userID = req.user?.userID;
            if (!userID) return res.status(401).json({ message: 'Unauthorized' });

            const submission = await Submission.findByPk(submissionID, {
                include: [{
                    model: QuesAns,
                    as: 'quesAns',
                    include: [{
                        model: Question,
                        as: 'questionInfo',
                        attributes: ['questionID', 'content', 'ansA', 'ansB', 'ansC', 'ansD', 'numericalOrder'],
                    }],
                }],
            });
            if (!submission) return res.status(404).json({ message: 'Submission not found' });
            if (submission.studentID !== userID) return res.status(403).json({ message: 'Forbidden' });
            if (submission.status !== 'ongoing') return res.status(400).json({ message: 'Submission is not ongoing' });

            const answers = (submission.quesAns || []).map(qa => ({
                questionID: qa.questionID,
                selectedAns: qa.selectedAns,
            }));
            return res.status(200).json({ answers });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async getSubmissionTiming(req, res) {
        try {
            const { submissionID } = req.params;
            const userID = req.user?.userID;
            if (!userID) return res.status(401).json({ message: 'Unauthorized' });

            const submission = await Submission.findByPk(submissionID, {
                include: {
                    model: Test,
                    as: 'test_submissions',
                    attributes: ['duration'],
                },
            });
            if (!submission) return res.status(404).json({ message: 'Submission not found' });
            if (submission.studentID !== userID) return res.status(403).json({ message: 'Forbidden' });
            if (submission.status !== 'ongoing') return res.status(400).json({ message: 'Submission is not ongoing' });

            const duration = submission.test_submissions?.duration ?? 0;
            const startedAt = submission.createdAt ? new Date(submission.createdAt).toISOString() : null;
            return res.status(200).json({
                startedAt,
                duration,
                serverTime: Date.now(),
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getSubmissionById(req, res) {
        try {
            const { submissionID } = req.params;
            const userID = req.user?.userID;
            if (!userID) return res.status(401).json({ message: 'Unauthorized' });

            const submission = await Submission.findByPk(submissionID, {
                include: [
                    {
                        model: QuesAns,
                        as: 'quesAns',
                        include: [
                            {
                                model: Question,
                                as: 'questionInfo',
                                attributes: ['questionID', 'content', 'ansA', 'ansB', 'ansC', 'ansD', 'correctAns', 'explanation', 'numericalOrder'],
                            },
                        ],
                    },
                    {
                        model: Test,
                        as: 'test_submissions',
                        attributes: ['testID', 'testName', 'numQuests'],
                    },
                ],
            });

            if (!submission) return res.status(404).json({ message: 'Submission not found' });
            if (submission.studentID !== userID) return res.status(403).json({ message: 'Forbidden' });

            return res.status(200).json(submission);
        } catch (error) {
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