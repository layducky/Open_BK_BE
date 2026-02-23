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

pg.defaults.ssl = process.env.SSL || false;
const DB_DIALECT = process.env.DB_DIALECT || "postgres";
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: DB_DIALECT,
  logging: false,
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

    let course = await Course.findOne({
      where: { authorID: collab.userID, courseName: "Sample Course" },
    });
    if (!course) {
      const courseID = generateCourseID();
      course = await Course.create({
        courseID,
        authorID: collab.userID,
        courseName: "Sample Course",
        image: DEFAULT_COURSE_IMAGE,
        description: "Sample course for seed data.",
        category: "CODE",
        price: "Free",
      });
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
        unitName: "Introduction Unit",
        description: "First unit of the sample course.",
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
        testName: "Sample Test 1",
        numericalOrder: 1,
        description: "Sample test for the introduction unit.",
        numQuests: 0,
        duration: 30,
        maxAttempts: 3,
        openDate: new Date(),
        closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    const answers = ["A", "B", "C", "D"];
    for (let i = 1; i <= 10; i++) {
      const existing = await Question.findOne({
        where: { testID: test.testID, numericalOrder: i },
      });
      if (!existing) {
        const questionID = generateQuestionID(test.testID);
        await Question.create({
          questionID,
          testID: test.testID,
          numericalOrder: i,
          content: `Sample question ${i}: What is the correct answer?`,
          explanation: `Explanation for question ${i}.`,
          correctAns: answers[(i - 1) % 4],
          ansA: "Option A",
          ansB: "Option B",
          ansC: "Option C",
          ansD: "Option D",
        });
      }
    }
    await Test.update(
      { numQuests: 10 },
      { where: { testID: test.testID } }
    );

    const [preview] = await Preview.findOrCreate({
      where: { courseID: course.courseID },
      defaults: {
        courseID: course.courseID,
        descriptionHeader: "Sample course preview",
        descriptionFull: "Full description of the sample course.",
        objective: ["Learn basics", "Complete the test"],
      },
    });

    console.log(
      "SeedAll hoàn thành. Đã tạo/kiểm tra: 1 Admin, 1 Collab, 1 Course, 1 Unit, 1 Test, 10 Question, 1 Preview."
    );
  } catch (err) {
    console.error("SeedAll thất bại:", err.message || err);
    await sequelize.close();
    process.exit(1);
  }
  await sequelize.close();
  process.exit(0);
})();
