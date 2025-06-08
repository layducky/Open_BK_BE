const pg = require("pg");
const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./models/user.model");
const CourseModel = require("./models/course.model");
const UnitModel = require("./models/unit.model");
const CommentModel = require("./models/comment.model");
const ContQuestionModel = require("./models/contQuestion.model");
const MaterialModel = require("./models/material.model");
const ParticipateModel = require("./models/participate.model");
const PreviewModel = require("./models/preview.model");

const TestModel = require("./models/test/test.model");
const QuestionModel = require("./models/test/question.model");
const submissionModel = require("./models/test/submission.model");
const quesAnswerModel = require("./models/test/quesAns.model");

// pg.defaults.ssl = true;  
const sequelize = new Sequelize(
  process.env.DB_URL,
  {
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  }
);

const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Unit = UnitModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const ContQuestion = ContQuestionModel(sequelize, DataTypes);
const Material = MaterialModel(sequelize, DataTypes);
const Participate = ParticipateModel(sequelize, DataTypes);
const Preview = PreviewModel(sequelize, DataTypes);

const Test = TestModel(sequelize, DataTypes);
const Question = QuestionModel(sequelize, DataTypes);
const Submission = submissionModel(sequelize, DataTypes);
const QuesAnswer = quesAnswerModel(sequelize, DataTypes);

// User - Course
User.belongsToMany(Course, {
  through: Participate,
  foreignKey: 'learnerID',
  as: 'learnerInfo',
});
User.hasMany(Course, {
  foreignKey: 'authorID',
  as: 'authorInfo',
});

// Course - User
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

// Unit - Course, Question
Unit.belongsTo(Course, { foreignKey: 'courseID', as: 'course_units', onDelete: 'CASCADE' });
Unit.hasMany(Test, { foreignKey: 'unitID', as: 'unit_questions' });

// Test - Course, User
Test.belongsTo(Unit, { foreignKey: 'unitID', as: 'unit' });
Test.hasMany(Question, { foreignKey: 'testID', as: 'test_questions' });

// Question - Unit
Question.belongsTo(Test, {
  foreignKey: 'testID',
  as: 'test_questions',
  onDelete: 'CASCADE',
});



// Comment - User
Comment.belongsTo(User, {
  foreignKey: 'userID',
});

// Preview - Course
Preview.belongsTo(Course, { foreignKey: 'courseID', as: 'course' });

// Participate - User, Course
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
  User,
  Course,
  Unit,
  Question,
  Comment,
  Preview,
  Participate,
  Test,
  Material,
  ContQuestion,
};