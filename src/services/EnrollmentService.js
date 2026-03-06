const { sequelize, Test, UserTest, Unit } = require('../sequelize');
const CourseRepository = require('../repositories/CourseRepository');
const ParticipateRepository = require('../repositories/ParticipateRepository');
const UserRepository = require('../repositories/UserRepository');
const { delCache, delCachePattern } = require('./cache.service');

const EnrollmentService = {
  async getEnrolledCourses(userID) {
    const learner = await UserRepository.findByPk(userID);
    if (!learner) return null;

    const enrolledCourses = await ParticipateRepository.findByLearnerWithCourses(userID);
    if (enrolledCourses.length === 0) return [];

    return enrolledCourses.map((enrolled) => {
      const course = enrolled.courseInfo;
      return {
        learnerID: enrolled.learnerID,
        courseID: enrolled.courseID,
        enrollmentDate: enrolled.enrollmentDate,
        status: enrolled.status,
        createdAt: enrolled.createdAt,
        updatedAt: enrolled.updatedAt,
        courseName: course.courseName,
        description: course.description,
        image: course.image,
        category: course.category,
        price: course.price,
        authorInfo: course.authorInfo,
      };
    });
  },

  async enrollCourse(userID, courseID) {
    return sequelize.transaction(async (t) => {
      const learner = await UserRepository.findByPk(userID, { transaction: t });
      if (!learner) return { error: 'Learner not found', status: 404 };

      const course = await CourseRepository.findById(courseID, { transaction: t });
      if (!course) return { error: 'Course not found', status: 404 };

      const existingEnrollment = await ParticipateRepository.findByLearnerAndCourse(userID, courseID, {
        transaction: t,
      });
      if (existingEnrollment) return { error: 'User is already enrolled in this course', status: 400 };

      await ParticipateRepository.create({ learnerID: userID, courseID }, { transaction: t });

      const tests = await Test.findAll({
        attributes: ['testID'],
        include: [{ model: Unit, as: 'unit_tests', where: { courseID }, attributes: [] }],
        transaction: t,
      });
      if (tests.length > 0) {
        const userTests = tests.map((test) => ({ userID, testID: test.testID }));
        await UserTest.bulkCreate(userTests, { ignoreDuplicates: true, transaction: t });
      }

      await delCache(`course:detail:${courseID}`).catch(() => {});
      await delCachePattern('course:list:*').catch(() => {});
      await delCachePattern(`course:units:${courseID}`).catch(() => {});

      return { success: true, status: 201 };
    });
  },

  async deleteEnrolledCourses(learnerID, courseID) {
    const course = await CourseRepository.findById(courseID);
    if (!course) return { error: 'Course not found!', status: 404 };

    const participation = await ParticipateRepository.findByLearnerAndCourse(learnerID, courseID);
    if (!participation) return { error: 'Learner not found in this course', status: 404 };

    const deleted = await ParticipateRepository.destroy({ learnerID, courseID });
    if (!deleted) return { error: 'Failed to delete', status: 500 };

    await delCache(`course:detail:${courseID}`).catch(() => {});
    await delCachePattern('course:list:*').catch(() => {});
    await delCachePattern(`course:units:${courseID}`).catch(() => {});

    return { success: true, status: 200 };
  },

  async getStats(userID, role) {
    if (role === 'LEARNER') {
      const enrolledCourses = await ParticipateRepository.countByLearner(userID);
      return { role, enrolledCourses: enrolledCourses ?? 0 };
    }
    if (role === 'COLLAB') {
      const ownedCourses = await CourseRepository.countByAuthor(userID);
      const [totalLearners, enrolledCourses] = await Promise.all([
        ParticipateRepository.countDistinctLearnersByAuthor(userID),
        (async () => {
          const courseIDs = (await CourseRepository.findIdsByAuthor(userID)).map((c) => c.courseID);
          return ParticipateRepository.countByCourseIDs(courseIDs);
        })(),
      ]);
      return { role, enrolledCourses, totalLearners, ownedCourses };
    }
    const enrolledCount = await ParticipateRepository.countAll();
    return { role, enrolledCourses: enrolledCount };
  },
};

module.exports = EnrollmentService;
