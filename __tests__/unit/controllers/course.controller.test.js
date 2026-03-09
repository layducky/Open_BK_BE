const mockGetAllCourses = jest.fn();
const mockGetCourseByID = jest.fn();
const mockInvalidateCourseCache = jest.fn();

jest.mock('../../../src/services/CourseService', () => ({
  getAllCourses: (...args) => mockGetAllCourses(...args),
  getCourseByID: (...args) => mockGetCourseByID(...args),
  invalidateCourseCache: (...args) => mockInvalidateCourseCache(...args),
}));

jest.mock('../../../src/repositories/CourseRepository');
jest.mock('../../../src/repositories/UserRepository');
jest.mock('../../../src/services/cache.service', () => ({
  getCache: jest.fn(),
  setCache: jest.fn().mockResolvedValue(undefined),
  delCache: jest.fn(),
  delCachePattern: jest.fn(),
  CACHE_TTL: { CATEGORIES: 3600 },
}));

const CourseRepository = require('../../../src/repositories/CourseRepository');
const UserRepository = require('../../../src/repositories/UserRepository');
const { getCache } = require('../../../src/services/cache.service');
const CourseController = require('../../../src/controllers/course/course.controller');

describe('course.controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, query: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getAllCourses', () => {
    it('should return 200 with courses on success', async () => {
      const courses = [{ courseID: 'COU1', courseName: 'Math' }];
      mockGetAllCourses.mockResolvedValue(courses);

      await CourseController.getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(courses);
    });

    it('should return 404 when no courses found', async () => {
      mockGetAllCourses.mockResolvedValue(null);

      await CourseController.getAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No course is found' });
    });
  });

  describe('getCategories', () => {
    it('should return cached categories on cache hit', async () => {
      const cached = [{ value: 'MATH', label: 'Math' }];
      getCache.mockResolvedValue(cached);

      await CourseController.getCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(cached);
    });

    it('should return categories on cache miss', async () => {
      getCache.mockResolvedValue(null);

      await CourseController.getCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ value: 'MATH', label: 'Math' }),
        ])
      );
    });
  });

  describe('getCourseByID', () => {
    it('should return 200 with payload on success', async () => {
      req.params = { courseID: 'COU1' };
      const payload = { courseID: 'COU1', courseName: 'Math' };
      mockGetCourseByID.mockResolvedValue(payload);

      await CourseController.getCourseByID(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(payload);
    });

    it('should return 404 when course not found', async () => {
      req.params = { courseID: 'COU999' };
      mockGetCourseByID.mockResolvedValue(null);

      await CourseController.getCourseByID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No course is found' });
    });
  });

  describe('updateCourse', () => {
    it('should return 200 on success', async () => {
      req.params = { courseID: 'COU1' };
      req.body = {
        courseName: 'New Name',
        description: 'Desc',
        price: 10,
        authorID: 'COL123',
      };
      CourseRepository.findById.mockResolvedValue({
        courseID: 'COU1',
        authorID: 'COL123',
      });
      UserRepository.findByPk.mockResolvedValue({
        userID: 'COL123',
        role: 'COLLAB',
      });
      CourseRepository.update.mockResolvedValue([1]);

      await CourseController.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated course successfully',
      });
    });

    it('should return 404 when course not found', async () => {
      req.params = { courseID: 'COU999' };
      req.body = { authorID: 'COL123' };
      CourseRepository.findById.mockResolvedValue(null);

      await CourseController.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
    });

    it('should return 403 when author is not COLLAB', async () => {
      req.params = { courseID: 'COU1' };
      req.body = { authorID: 'LEA123' };
      CourseRepository.findById.mockResolvedValue({
        courseID: 'COU1',
        authorID: 'COL123',
      });
      UserRepository.findByPk.mockResolvedValue({
        userID: 'LEA123',
        role: 'LEARNER',
      });

      await CourseController.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'You do not have permission to update this course, role must be COLLAB',
      });
    });
  });

  describe('deleteCourse', () => {
    it('should return 200 on success', async () => {
      req.params = { courseID: 'COU1' };
      CourseRepository.destroy.mockResolvedValue(1);

      await CourseController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Deleted course successfully',
      });
    });

    it('should return 404 when course not found', async () => {
      req.params = { courseID: 'COU999' };
      CourseRepository.destroy.mockResolvedValue(0);

      await CourseController.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
    });
  });

  describe('deleteAllCourses', () => {
    it('should return 200 on success', async () => {
      CourseRepository.destroyAll.mockResolvedValue(5);

      await CourseController.deleteAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All courses deleted successfully',
      });
    });

    it('should return 404 when no courses to delete', async () => {
      CourseRepository.destroyAll.mockResolvedValue(0);

      await CourseController.deleteAllCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No courses found to delete',
      });
    });
  });
});
