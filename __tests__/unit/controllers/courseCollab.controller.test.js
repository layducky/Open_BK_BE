jest.mock('../../../src/repositories/CourseRepository');
jest.mock('../../../src/repositories/ParticipateRepository');
jest.mock('../../../src/services/CourseService');

const CourseRepository = require('../../../src/repositories/CourseRepository');
const ParticipateRepository = require('../../../src/repositories/ParticipateRepository');
const CourseService = require('../../../src/services/CourseService');
const CourseCollab = require('../../../src/controllers/course/courseCollab.controller');

describe('courseCollab.controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      body: {},
      user: { userID: 'COL123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createCourse', () => {
    it('should return 201 on success', async () => {
      req.body = {
        courseName: 'Math',
        image: 'img.png',
        category: 'MATH',
        description: 'Desc',
        price: 0,
      };
      CourseRepository.create.mockResolvedValue({});

      await CourseCollab.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Course creation is successful',
        })
      );
      expect(res.json.mock.calls[0][0].courseID).toMatch(/^COU\d{6}$/);
    });

    it('should return 400 when courseName or image is null', async () => {
      req.body = { courseName: 'Math', image: null };

      await CourseCollab.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Course creation failed, some fields are missing',
      });
    });

    it('should return 400 when price is negative', async () => {
      req.body = {
        courseName: 'Math',
        image: 'img.png',
        price: -10,
      };

      await CourseCollab.createCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Price cannot be negative',
      });
    });
  });

  describe('getAllOwnedCourses', () => {
    it('should return 200 with courses on success', async () => {
      const courses = [{ courseID: 'COU1', courseName: 'Math' }];
      CourseRepository.findByAuthor.mockResolvedValue(courses);

      await CourseCollab.getAllOwnedCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(courses);
    });

    it('should return 404 when no owned courses', async () => {
      CourseRepository.findByAuthor.mockResolvedValue([]);

      await CourseCollab.getAllOwnedCourses(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No owned courses found for this author',
      });
    });
  });

  describe('getAllLearners', () => {
    it('should return 200 with learners on success', async () => {
      req.params = { courseID: 'COU1' };
      CourseRepository.findById.mockResolvedValue({});
      ParticipateRepository.findByCourse.mockResolvedValue([
        { learnerID: 'LEA1' },
      ]);

      await CourseCollab.getAllLearners(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ learnerID: 'LEA1' }]);
    });

    it('should return 404 when course not found', async () => {
      req.params = { courseID: 'COU999' };
      CourseRepository.findById.mockResolvedValue(null);

      await CourseCollab.getAllLearners(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
    });

    it('should return 404 when no learners', async () => {
      req.params = { courseID: 'COU1' };
      CourseRepository.findById.mockResolvedValue({});
      ParticipateRepository.findByCourse.mockResolvedValue([]);

      await CourseCollab.getAllLearners(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No learners found for this course',
      });
    });
  });

  describe('updateCourse', () => {
    it('should return 200 on success', async () => {
      req.params = { courseID: 'COU1' };
      req.body = {
        courseName: 'New',
        image: 'img.png',
        category: 'MATH',
        description: 'Desc',
        price: 10,
      };
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      CourseRepository.findById.mockResolvedValue({
        update: mockUpdate,
      });

      await CourseCollab.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Course update is successful',
      });
    });

    it('should return 404 when course not found', async () => {
      req.params = { courseID: 'COU999' };
      req.body = {
        courseName: 'New',
        image: 'img.png',
        category: 'MATH',
        description: 'Desc',
        price: 10,
      };
      CourseRepository.findById.mockResolvedValue(null);

      await CourseCollab.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Course not found' });
    });

    it('should return 400 when price is negative', async () => {
      req.params = { courseID: 'COU1' };
      req.body = {
        courseName: 'New',
        image: 'img.png',
        category: 'MATH',
        description: 'Desc',
        price: -5,
      };
      CourseRepository.findById.mockResolvedValue({ update: jest.fn() });

      await CourseCollab.updateCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Price cannot be negative',
      });
    });
  });

  describe('deleteCourse', () => {
    it('should return 200 on success', async () => {
      req.params = { courseID: 'COU1' };
      CourseService.deleteCourseWithCascade.mockResolvedValue({ success: true });

      await CourseCollab.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Deleted course successfully',
      });
    });

    it('should return error status when CourseService returns error', async () => {
      req.params = { courseID: 'COU999' };
      CourseService.deleteCourseWithCascade.mockResolvedValue({
        error: 'Course not found',
        status: 404,
      });

      await CourseCollab.deleteCourse(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Course not found' });
    });
  });
});
