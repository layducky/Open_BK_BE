require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pg = require("pg");
const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");

const UserModel = require("../src/models/user.model");
const CourseModel = require("../src/models/course.model");
const UnitModel = require("../src/models/unit.model");
const PreviewModel = require("../src/models/preview.model");
const TestModel = require("../src/models/test/test.model");
const QuestionModel = require("../src/models/test/question.model");

const {
  generateCollabID,
  generateCourseID,
  generateUnitID,
  generateTestID,
  generateQuestionID,
} = require("../src/utils/generateID");

// RDS SSL - rejectUnauthorized: false để chấp nhận cert AWS
const useSSL = process.env.SSL !== "false";
const sslConfig = useSSL ? { rejectUnauthorized: false } : false;
pg.defaults.ssl = sslConfig;
const DB_DIALECT = process.env.DB_DIALECT || "postgres";
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: DB_DIALECT,
  logging: false,
  dialectOptions: useSSL
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
});

const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Unit = UnitModel(sequelize, DataTypes);
const Preview = PreviewModel(sequelize, DataTypes);
const Test = TestModel(sequelize, DataTypes);
const Question = QuestionModel(sequelize, DataTypes);

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dv2izp0a3/image/upload/v1771752241/default-avatar_hnzfdu.jpg";
const DEFAULT_COURSE_IMAGE =
  "https://t4.ftcdn.net/jpg/07/77/57/53/360_F_777575393_rZskmeQsWOY8TXBjwjcyBOHamOQfZyHs.jpg";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";
const COLLAB_EMAIL = "collab@gmail.com";
const COLLAB_PASSWORD = "collab";

const SEED_ADMIN_ID = "ADM001";
const SEED_COLLAB_ID = generateCollabID();

// 8 courses: 2 per category (MATH, ENGLISH, CODE, ART)
// Each category has at least 1 free course
const PAID_PRICES = ["5", "10", "15", "20", "25", "30"];

const randomPrice = () => PAID_PRICES[Math.floor(Math.random() * PAID_PRICES.length)];

const COURSE_CONFIG = [
  { name: "MATH 1", category: "MATH", description: "Basic arithmetic and numbers.", price: "0" },
  { name: "MATH 2", category: "MATH", description: "Introduction to geometry and shapes.", price: randomPrice() },
  { name: "ENGLISH 1", category: "ENGLISH", description: "Basic vocabulary and grammar.", price: randomPrice() },
  { name: "ENGLISH 2", category: "ENGLISH", description: "Simple sentences and reading.", price: "0" },
  { name: "CODE 1", category: "CODE", description: "Programming basics and logic.", price: "0" },
  { name: "CODE 2", category: "CODE", description: "Variables and data types.", price: randomPrice() },
  { name: "ART 1", category: "ART", description: "Colors and basic design.", price: randomPrice() },
  { name: "ART 2", category: "ART", description: "Shapes and composition.", price: "0" },
];

// 6 questions per category - meaningful and simple
const QUESTIONS_BY_CATEGORY = {
  MATH: [
    { content: "What is 5 + 3?", ansA: "6", ansB: "7", ansC: "8", ansD: "9", correct: "C", explanation: "5 + 3 = 8" },
    { content: "What is 10 - 4?", ansA: "5", ansB: "6", ansC: "7", ansD: "8", correct: "B", explanation: "10 - 4 = 6" },
    { content: "What is 3 × 4?", ansA: "10", ansB: "11", ansC: "12", ansD: "13", correct: "C", explanation: "3 × 4 = 12" },
    { content: "What is 20 ÷ 5?", ansA: "3", ansB: "4", ansC: "5", ansD: "6", correct: "B", explanation: "20 ÷ 5 = 4" },
    { content: "How many sides does a triangle have?", ansA: "2", ansB: "3", ansC: "4", ansD: "5", correct: "B", explanation: "A triangle has 3 sides" },
    { content: "What is the next number: 2, 4, 6, 8, ?", ansA: "9", ansB: "10", ansC: "11", ansD: "12", correct: "B", explanation: "The pattern adds 2 each time" },
  ],
  ENGLISH: [
    { content: "What is the opposite of 'hot'?", ansA: "cold", ansB: "warm", ansC: "cool", ansD: "mild", correct: "A", explanation: "Hot and cold are opposites" },
    { content: "Which word is a noun?", ansA: "run", ansB: "happy", ansC: "book", ansD: "quickly", correct: "C", explanation: "A book is a thing, so it's a noun" },
    { content: "Choose the correct article: ___ apple", ansA: "a", ansB: "an", ansC: "the", ansD: "no article", correct: "B", explanation: "We use 'an' before vowel sounds" },
    { content: "What is the past tense of 'go'?", ansA: "goed", ansB: "went", ansC: "gone", ansD: "going", correct: "B", explanation: "The past tense of go is went" },
    { content: "Which sentence is correct?", ansA: "He go to school", ansB: "He goes to school", ansC: "He going to school", ansD: "He gone to school", correct: "B", explanation: "Third person singular uses 'goes'" },
    { content: "What does 'happy' mean?", ansA: "sad", ansB: "angry", ansC: "joyful", ansD: "tired", correct: "C", explanation: "Happy means feeling joy or pleasure" },
  ],
  CODE: [
    { content: "What does a variable store?", ansA: "A file", ansB: "A value or data", ansC: "A website", ansD: "A password", correct: "B", explanation: "Variables store values or data" },
    { content: "Which symbol is used for assignment in most languages?", ansA: "=", ansB: "==", ansC: "===", ansD: ":=", correct: "A", explanation: "= is used to assign a value" },
    { content: "What is a loop used for?", ansA: "Storing data", ansB: "Repeating code", ansC: "Printing text", ansD: "Creating variables", correct: "B", explanation: "Loops repeat a block of code" },
    { content: "What is an if statement used for?", ansA: "Storing data", ansB: "Making decisions", ansC: "Repeating code", ansD: "Defining functions", correct: "B", explanation: "If statements make decisions based on conditions" },
    { content: "What type of data is 'hello'?", ansA: "Number", ansB: "Boolean", ansC: "String", ansD: "Array", correct: "C", explanation: "Text in quotes is a string" },
    { content: "What does 'true' or 'false' represent?", ansA: "String", ansB: "Number", ansC: "Boolean", ansD: "Array", correct: "C", explanation: "Boolean represents true or false" },
  ],
  ART: [
    { content: "What are the primary colors?", ansA: "Red, yellow, blue", ansB: "Green, orange, purple", ansC: "Black, white, gray", ansD: "Pink, cyan, brown", correct: "A", explanation: "Red, yellow, and blue are primary colors" },
    { content: "What do you get when you mix red and yellow?", ansA: "Green", ansB: "Orange", ansC: "Purple", ansD: "Blue", correct: "B", explanation: "Red + yellow = orange" },
    { content: "What shape has 4 equal sides?", ansA: "Triangle", ansB: "Rectangle", ansC: "Square", ansD: "Circle", correct: "C", explanation: "A square has 4 equal sides" },
    { content: "What is a line that shows the edge of a shape called?", ansA: "Color", ansB: "Outline", ansC: "Texture", ansD: "Shadow", correct: "B", explanation: "An outline defines the edge of a shape" },
    { content: "Which element creates depth in art?", ansA: "Line only", ansB: "Color only", ansC: "Shading and perspective", ansD: "Size only", correct: "C", explanation: "Shading and perspective create depth" },
    { content: "What is the space around an object in art called?", ansA: "Foreground", ansB: "Background", ansC: "Negative space", ansD: "Outline", correct: "C", explanation: "Negative space is the area around the subject" },
  ],
};

(async () => {
  try {
    await sequelize.authenticate();

    const [admin] = await User.findOrCreate({
      where: { email: ADMIN_EMAIL },
      defaults: {
        userID: SEED_ADMIN_ID,
        name: "Admin",
        email: ADMIN_EMAIL,
        password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
        image: DEFAULT_IMAGE,
        provider: "credentials",
        role: "ADMIN",
        providerId: "admin-credentials-seed",
      },
    });

    const [collab] = await User.findOrCreate({
      where: { email: COLLAB_EMAIL },
      defaults: {
        userID: SEED_COLLAB_ID,
        name: "Collaborator",
        email: COLLAB_EMAIL,
        password: bcrypt.hashSync(COLLAB_PASSWORD, 10),
        image: DEFAULT_IMAGE,
        provider: "credentials",
        role: "COLLAB",
        providerId: "collab-credentials-seed",
      },
    });

    for (const config of COURSE_CONFIG) {
      let course = await Course.findOne({
        where: { authorID: collab.userID, courseName: config.name },
      });

      if (!course) {
        const courseID = generateCourseID();
        course = await Course.create({
          courseID,
          authorID: collab.userID,
          courseName: config.name,
          image: DEFAULT_COURSE_IMAGE,
          description: config.description,
          category: config.category,
          price: config.price || "0",
        });
      } else {
        await course.update({ price: config.price || "0" });
      }

      let unit = await Unit.findOne({
        where: { courseID: course.courseID, numericalOrder: 1 },
      });

      if (!unit) {
        const unitID = generateUnitID(course.courseID);
        unit = await Unit.create({
          unitID,
          courseID: course.courseID,
          numericalOrder: 1,
          unitName: `Unit 1: ${config.name} Basics`,
          description: `First unit of ${config.name}.`,
        });
      }

      let test = await Test.findOne({
        where: { unitID: unit.unitID, numericalOrder: 1 },
      });

      if (!test) {
        const testID = generateTestID();
        test = await Test.create({
          testID,
          unitID: unit.unitID,
          testName: `${config.name} Quiz`,
          numericalOrder: 1,
          description: `Quiz for ${config.name}.`,
          numQuests: 0,
          duration: 15,
          maxAttempts: 3,
          openDate: new Date(),
          closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }

      const questions = QUESTIONS_BY_CATEGORY[config.category] || QUESTIONS_BY_CATEGORY.MATH;
      for (let i = 1; i <= 6; i++) {
        const q = questions[i - 1];
        const existing = await Question.findOne({
          where: { testID: test.testID, numericalOrder: i },
        });
        if (!existing) {
          const questionID = generateQuestionID(test.testID);
          await Question.create({
            questionID,
            testID: test.testID,
            numericalOrder: i,
            content: q.content,
            explanation: q.explanation,
            correctAns: q.correct,
            ansA: q.ansA,
            ansB: q.ansB,
            ansC: q.ansC,
            ansD: q.ansD,
          });
        }
      }

      await Test.update(
        { numQuests: 6 },
        { where: { testID: test.testID } }
      );

      await Preview.findOrCreate({
        where: { courseID: course.courseID },
        defaults: {
          courseID: course.courseID,
          descriptionHeader: `${config.name} preview`,
          descriptionFull: `Learn the basics of ${config.name}.`,
          objective: ["Complete 6 quiz questions", "Reinforce your knowledge"],
        },
      });
    }

    console.log(
      "SeedAll completed. Created/verified: 1 Admin, 1 Collab, 8 Courses (MATH 1-2, ENGLISH 1-2, CODE 1-2, ART 1-2), each with 1 Unit, 1 Test, 6 Questions."
    );
  } catch (err) {
    console.error("SeedAll failed:", err.message || err);
    await sequelize.close();
    process.exit(1);
  }
  await sequelize.close();
  process.exit(0);
})();
