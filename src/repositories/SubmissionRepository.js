const { Submission, UserTest, Question, Test, QuesAns } = require('../sequelize');
const { Op } = require('sequelize');

const SubmissionRepository = {
  findByPk(submissionID, options = {}) {
    return Submission.findByPk(submissionID, options);
  },

  findByPkWithTest(submissionID, options = {}) {
    return Submission.findByPk(submissionID, {
      include: {
        model: Test,
        as: 'test_submissions',
        attributes: ['numQuests', 'duration'],
      },
      ...options,
    });
  },

  findLatestByUserTest(userTestID, options = {}) {
    return Submission.findOne({
      where: { userTestID },
      order: [['numericalOrder', 'DESC']],
      ...options,
    });
  },

  findQuestionsByTestAndIds(testID, questionIDs, options = {}) {
    if (questionIDs.length === 0) return Promise.resolve([]);
    return Question.findAll({
      where: {
        questionID: { [Op.in]: questionIDs },
        testID,
      },
      attributes: ['questionID', 'correctAns'],
      ...options,
    });
  },

  upsertQuesAns(record, options = {}) {
    return QuesAns.upsert(record, options);
  },
};

module.exports = SubmissionRepository;
