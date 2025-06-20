const pg = require("pg");
const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./models/user.model");
const CourseModel = require("./models/course.model");
const UnitModel = require("./models/unit.model");
const CommentModel = require("./models/comment.model");
const ParticipateModel = require("./models/participate.model");
const PreviewModel = require("./models/preview.model");

const TestModel = require("./models/test/test.model");
const QuestionModel = require("./models/test/question.model");
const UserTestModel = require("./models/test/userTest.model");
const SubmissionModel = require("./models/test/submission.model");
const quesAnswerModel = require("./models/test/quesAns.model");

pg.defaults.ssl = process.env.SSL || false;
DB_DIALECT = process.env.DB_DIALECT || 'postgres';
const sequelize = new Sequelize(
  process.env.DB_URL,
  {
    dialect: DB_DIALECT ,
    logging: false,
  }
);

const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Unit = UnitModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Participate = ParticipateModel(sequelize, DataTypes);
const Preview = PreviewModel(sequelize, DataTypes);

const Test = TestModel(sequelize, DataTypes);
const Question = QuestionModel(sequelize, DataTypes);
const UserTest = UserTestModel(sequelize, DataTypes);
const Submission = SubmissionModel(sequelize, DataTypes);
const QuesAns = quesAnswerModel(sequelize, DataTypes);

User.belongsToMany(Course, {
  through: Participate,
  foreignKey: 'learnerID',
  as: 'learnerInfo',
});
User.hasMany(Course, {
  foreignKey: 'authorID',
  as: 'authorInfo',
});
User.hasMany(Submission, { foreignKey: 'studentID', as: 'user_submissions' })

Course.hasMany(Unit, { foreignKey: 'courseID', as: 'course_units' });
Course.hasOne(Preview, { foreignKey: 'courseID', as: 'preview' });
Course.belongsToMany(User, {
  through: Participate,
  foreignKey: 'courseID',
  as: 'courseInfo',
});
Course.belongsTo(User, {
  foreignKey: 'authorID',
  as: 'authorInfo',
  onDelete: 'CASCADE',
});

Unit.belongsTo(Course, { foreignKey: 'courseID', as: 'course_units', onDelete: 'CASCADE' });
Unit.hasMany(Test, { foreignKey: 'unitID', as: 'unit_tests' });

Test.belongsTo(Unit, { foreignKey: 'unitID', as: 'unit_tests', onDelete: 'CASCADE' });
Test.hasMany(UserTest, { foreignKey: 'testID', as: 'user_tests' });
Test.hasMany(Submission, { foreignKey: 'testID', as: 'test_submissions' });
Test.hasMany(Question, { foreignKey: 'testID', as: 'test_questions' });


Question.belongsTo(Test, {
  foreignKey: 'testID',
  as: 'test_questions',
  onDelete: 'CASCADE',
});
Question.hasMany(QuesAns, { foreignKey: 'questionID', as: 'questionInfo'})

UserTest.belongsTo(Test, { foreignKey: 'testID', as: 'user_tests', onDelete: 'CASCADE' });
UserTest.hasMany(Submission, { foreignKey: 'testID', as: 'userTest_submissions' });

Submission.belongsTo(Test, { foreignKey: 'testID', as: 'test_submissions'});
Submission.belongsTo(UserTest, { foreignKey: 'testID', as: 'userTest_submissions', onDelete: 'CASCADE'});
Submission.hasMany(QuesAns, { foreignKey: 'submissionID', as: 'quesAns'});

QuesAns.belongsTo(Question, { foreignKey: 'questionID', as: 'questionInfo', onDelete: 'CASCADE'});
QuesAns.belongsTo(Submission, { foreignKey: 'submissionID', as: 'quesAns', onDelete: 'CASCADE' });

Comment.belongsTo(User, {
  foreignKey: 'userID',
});

Preview.belongsTo(Course, { foreignKey: 'courseID', as: 'course' });

Participate.belongsTo(User, {
  foreignKey: 'learnerID',
  as: 'learnerInfo',
  onDelete: 'CASCADE',
});
Participate.belongsTo(Course, {
  foreignKey: 'courseID',
  as: 'courseInfo',
  onDelete: 'CASCADE',
});


(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Database synced');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
})();

module.exports = {
  sequelize,
  User,
  Course,
  Unit,
  Question,
  Comment,
  Preview,
  Participate,
  Test,
  UserTest,
  Submission,
  QuesAns,
};