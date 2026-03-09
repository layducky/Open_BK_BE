const mockTransaction = {};
const mockTransactionFn = jest.fn((callback) => callback(mockTransaction));

jest.mock('../../../src/sequelize', () => ({
  sequelize: {
    transaction: mockTransactionFn,
  },
  Test: {
    findAll: jest.fn(),
  },
  UserTest: {
    bulkCreate: jest.fn().mockResolvedValue([]),
  },
  Unit: {},
}));

jest.mock('../../../src/repositories/CourseRepository');
jest.mock('../../../src/repositories/ParticipateRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/services/cache.service', () => ({
  delCache: jest.fn().mockResolvedValue(undefined),
  delCachePattern: jest.fn().mockResolvedValue(undefined),
}));

const CourseRepository = require('../../../src/repositories/CourseRepository');
const ParticipateRepository = require('../../../src/repositories/ParticipateRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const { Test } = require('../../../src/sequelize');
const EnrollmentService = require('../../../src/services/EnrollmentService');

describe('EnrollmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEnrolledCourses', () => {
    it('should return null when learner does not exist', async () => {
      UserRepository.findByPk.mockResolvedValue(null);

      const result = await EnrollmentService.getEnrolledCourses('LEA999999');

      expect(result).toBeNull();
    });

    it('should return empty array when no enrollments', async () => {
      UserRepository.findByPk.mockResolvedValue({ userID: 'LEA123' });
      ParticipateRepository.findByLearnerWithCourses.mockResolvedValue([]);

      const result = await EnrollmentService.getEnrolledCourses('LEA123');

      expect(result).toEqual([]);
    });

    it('should return mapped enrollments with courseInfo', async () => {
      UserRepository.findByPk.mockResolvedValue({ userID: 'LEA123' });
      const enrolled = [
        {
          learnerID: 'LEA123',
          courseID: 'COU123',
          enrollmentDate: new Date(),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          courseInfo: {
            courseName: 'Math',
            description: 'Desc',
            image: 'img.png',
            category: 'MATH',
            price: 'Free',
            authorInfo: { name: 'Author' },
          },
        },
      ];
      ParticipateRepository.findByLearnerWithCourses.mockResolvedValue(enrolled);

      const result = await EnrollmentService.getEnrolledCourses('LEA123');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        learnerID: 'LEA123',
        courseID: 'COU123',
        courseName: 'Math',
        description: 'Desc',
        category: 'MATH',
      });
    });
  });

  describe('enrollCourse', () => {
    it('should return 404 when learner not found', async () => {
      UserRepository.findByPk.mockResolvedValue(null);

      const result = await EnrollmentService.enrollCourse('LEA999', 'COU123');

      expect(result).toEqual({ error: 'Learner not found', status: 404 });
    });

    it('should return 404 when course not found', async () => {
      UserRepository.findByPk.mockResolvedValue({});
      CourseRepository.findById.mockResolvedValue(null);

      const result = await EnrollmentService.enrollCourse('LEA123', 'COU999');

      expect(result).toEqual({ error: 'Course not found', status: 404 });
    });

    it('should return 400 when already enrolled', async () => {
      UserRepository.findByPk.mockResolvedValue({});
      CourseRepository.findById.mockResolvedValue({});
      ParticipateRepository.findByLearnerAndCourse.mockResolvedValue({});

      const result = await EnrollmentService.enrollCourse('LEA123', 'COU123');

      expect(result).toEqual({
        error: 'User is already enrolled in this course',
        status: 400,
      });
    });

    it('should return success on enroll', async () => {
      UserRepository.findByPk.mockResolvedValue({});
      CourseRepository.findById.mockResolvedValue({});
      ParticipateRepository.findByLearnerAndCourse.mockResolvedValue(null);
      ParticipateRepository.create.mockResolvedValue({});
      Test.findAll.mockResolvedValue([{ testID: 'TES1' }]);

      const result = await EnrollmentService.enrollCourse('LEA123', 'COU123');

      expect(result).toEqual({ success: true, status: 201 });
      expect(ParticipateRepository.create).toHaveBeenCalledWith(
        { learnerID: 'LEA123', courseID: 'COU123' },
        { transaction: mockTransaction }
      );
    });
  });

  describe('deleteEnrolledCourses', () => {
    it('should return 404 when course not found', async () => {
      CourseRepository.findById.mockResolvedValue(null);

      const result = await EnrollmentService.deleteEnrolledCourses(
        'LEA123',
        'COU999'
      );

      expect(result).toEqual({ error: 'Course not found!', status: 404 });
    });

    it('should return 404 when learner not in course', async () => {
      CourseRepository.findById.mockResolvedValue({});
      ParticipateRepository.findByLearnerAndCourse.mockResolvedValue(null);

      const result = await EnrollmentService.deleteEnrolledCourses(
        'LEA123',
        'COU123'
      );

      expect(result).toEqual({
        error: 'Learner not found in this course',
        status: 404,
      });
    });

    it('should return success on delete', async () => {
      CourseRepository.findById.mockResolvedValue({});
      ParticipateRepository.findByLearnerAndCourse.mockResolvedValue({});
      ParticipateRepository.destroy.mockResolvedValue(1);

      const result = await EnrollmentService.deleteEnrolledCourses(
        'LEA123',
        'COU123'
      );

      expect(result).toEqual({ success: true, status: 200 });
    });
  });

  describe('getStats', () => {
    it('should return LEARNER stats', async () => {
      ParticipateRepository.countByLearner.mockResolvedValue(5);

      const result = await EnrollmentService.getStats('LEA123', 'LEARNER');

      expect(result).toEqual({ role: 'LEARNER', enrolledCourses: 5 });
    });

    it('should return COLLAB stats', async () => {
      CourseRepository.countByAuthor.mockResolvedValue(3);
      CourseRepository.findIdsByAuthor.mockResolvedValue([
        { courseID: 'COU1' },
        { courseID: 'COU2' },
      ]);
      ParticipateRepository.countDistinctLearnersByAuthor.mockResolvedValue(10);
      ParticipateRepository.countByCourseIDs.mockResolvedValue(15);

      const result = await EnrollmentService.getStats('COL123', 'COLLAB');

      expect(result).toMatchObject({
        role: 'COLLAB',
        ownedCourses: 3,
        totalLearners: 10,
        enrolledCourses: 15,
      });
    });

    it('should return ADMIN stats', async () => {
      ParticipateRepository.countAll.mockResolvedValue(100);

      const result = await EnrollmentService.getStats('ADMIN1', 'ADMIN');

      expect(result).toEqual({ role: 'ADMIN', enrolledCourses: 100 });
    });
  });
});
