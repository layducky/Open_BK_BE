const pg = require("pg");
const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./models/user.model");
const CourseModel = require("./models/course.model");
const UnitModel = require("./models/unit.model");
const QuestionModel = require("./models/question.model");
const CommentModel = require("./models/comment.model");
const TestModel = require("./models/test.model");
const ContQuestionModel = require("./models/contQuestion.model");
const MaterialModel = require("./models/material.model");
const ParticipateModel = require("./models/participate.model");
const PreviewModel = require("./models/preview.model");

pg.defaults.ssl = true;  
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
const Question = QuestionModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const ContQuestion = ContQuestionModel(sequelize, DataTypes);
const Test = TestModel(sequelize, DataTypes);
const Material = MaterialModel(sequelize, DataTypes);
const Participate = ParticipateModel(sequelize, DataTypes);
const Preview = PreviewModel(sequelize, DataTypes);


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
Unit.hasMany(Question, { foreignKey: 'unitID', as: 'unit_questions' });

// Question - Unit
Question.belongsTo(Unit, {
  foreignKey: 'unitID',
  as: 'unit_questions',
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

// Test - Course, User
Test.belongsTo(Course, { foreignKey: 'courseID', as: 'course' });
Test.belongsTo(User, { foreignKey: 'userID', as: 'user' });

// Kiểm tra kết nối và đồng bộ database
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