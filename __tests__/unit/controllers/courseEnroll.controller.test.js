const mockGetEnrolledCourses = jest.fn();
const mockEnrollCourse = jest.fn();
const mockDeleteEnrolledCourses = jest.fn();
const mockGetStats = jest.fn();

jest.mock('../../../src/services/EnrollmentService', () => ({
  getEnrolledCourses: (...args) => mockGetEnrolledCourses(...args),
  enrollCourse: (...args) => mockEnrollCourse(...args),
  deleteEnrolledCourses: (...args) => mockDeleteEnrolledCourses(...args),
  getStats: (...args) => mockGetStats(...args),
}));

const courseEnroll = require('../../../src/controllers/course/courseEnroll.controller');

describe('courseEnroll.controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, user: { userID: 'LEA123', userRole: 'LEARNER' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getEnrolledCourses', () => {
    it('should return 200 with data on success', async () => {
      const data = [{ courseID: 'COU1', courseName: 'Math' }];
      mockGetEnrolledCourses.mockResolvedValue(data);

      await courseEnroll.getEnrolledCourses(req, res);

      expect(mockGetEnrolledCourses).toHaveBeenCalledWith('LEA123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it('should return 404 when result is null', async () => {
      mockGetEnrolledCourses.mockResolvedValue(null);

      await courseEnroll.getEnrolledCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Learner not found' });
    });
  });

  describe('enrollCourse', () => {
    it('should return 201 on success', async () => {
      req.params = { courseID: 'COU123' };
      mockEnrollCourse.mockResolvedValue({ success: true });

      await courseEnroll.enrollCourse(req, res);

      expect(mockEnrollCourse).toHaveBeenCalledWith('LEA123', 'COU123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Enrolled in course successfully',
      });
    });

    it('should return error status when result has error', async () => {
      req.params = { courseID: 'COU123' };
      mockEnrollCourse.mockResolvedValue({
        error: 'Course not found',
        status: 404,
      });

      await courseEnroll.enrollCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
    });
  });

  describe('deleteEnrolledCourses', () => {
    it('should return 200 on success', async () => {
      req.params = { courseID: 'COU123' };
      mockDeleteEnrolledCourses.mockResolvedValue({ success: true });

      await courseEnroll.deleteEnrolledCourses(req, res);

      expect(mockDeleteEnrolledCourses).toHaveBeenCalledWith('LEA123', 'COU123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Deleted learner from course successfully',
      });
    });

    it('should return 400 when learnerID is missing', async () => {
      req.params = { courseID: 'COU123' };
      req.user = { userRole: 'LEARNER' };

      await courseEnroll.deleteEnrolledCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Learner ID is missing!',
      });
    });
  });

  describe('getStats', () => {
    it('should return 200 with stats on success', async () => {
      mockGetStats.mockResolvedValue({ role: 'LEARNER', enrolledCourses: 5 });

      await courseEnroll.getStats(req, res);

      expect(mockGetStats).toHaveBeenCalledWith('LEA123', 'LEARNER');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        role: 'LEARNER',
        enrolledCourses: 5,
      });
    });

    it('should return 400 when userID or role is missing', async () => {
      req.user = {};

      await courseEnroll.getStats(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User information is missing',
      });
    });
  });
});
