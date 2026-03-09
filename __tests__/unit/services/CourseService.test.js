jest.mock('../../../src/repositories/CourseRepository');
jest.mock('../../../src/repositories/ParticipateRepository');
jest.mock('../../../src/services/cache.service', () => ({
  getCache: jest.fn(),
  setCache: jest.fn().mockResolvedValue(undefined),
  delCache: jest.fn().mockResolvedValue(undefined),
  delCachePattern: jest.fn().mockResolvedValue(undefined),
  CACHE_TTL: { COURSE_LIST: 300, COURSE_DETAIL: 300 },
}));

const CourseRepository = require('../../../src/repositories/CourseRepository');
const ParticipateRepository = require('../../../src/repositories/ParticipateRepository');
const { getCache, delCache, delCachePattern } = require('../../../src/services/cache.service');
const CourseService = require('../../../src/services/CourseService');

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCache.mockResolvedValue(null);
  });

  describe('getAllCourses', () => {
    it('should return cached data on cache hit', async () => {
      const cached = { courses: [{ courseID: 'COU1' }], total: 1 };
      getCache.mockResolvedValue(cached);

      const result = await CourseService.getAllCourses(null, null, null, 1, 10);

      expect(result).toEqual(cached);
      expect(CourseRepository.findWithFilters).not.toHaveBeenCalled();
    });

    it('should fetch from DB and return with learnersCount on cache miss', async () => {
      const mockCourses = [
        { courseID: 'COU1', toJSON: () => ({ courseID: 'COU1', courseName: 'Math' }) },
        { courseID: 'COU2', toJSON: () => ({ courseID: 'COU2', courseName: 'Eng' }) },
      ];
      CourseRepository.findWithFilters.mockResolvedValue(mockCourses);
      ParticipateRepository.countGroupedByCourse.mockResolvedValue({
        COU1: 5,
        COU2: 3,
      });

      const result = await CourseService.getAllCourses('math', 'MATH', null);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        courseID: 'COU1',
        courseName: 'Math',
        learnersCount: 5,
      });
    });

    it('should return null when no courses found', async () => {
      CourseRepository.findWithFilters.mockResolvedValue(null);

      const result = await CourseService.getAllCourses();

      expect(result).toBeNull();
    });
  });

  describe('getCourseByID', () => {
    it('should return cached data on cache hit', async () => {
      const cached = { courseID: 'COU1', courseName: 'Math' };
      getCache.mockResolvedValue(cached);

      const result = await CourseService.getCourseByID('COU1');

      expect(result).toEqual(cached);
      expect(CourseRepository.findByIdWithAuthor).not.toHaveBeenCalled();
    });

    it('should return null when course not found', async () => {
      CourseRepository.findByIdWithAuthor.mockResolvedValue(null);

      const result = await CourseService.getCourseByID('COU999');

      expect(result).toBeNull();
    });

    it('should return course with learnersCount and authorStats on success', async () => {
      const mockCourse = {
        courseID: 'COU1',
        authorID: 'COL123',
        authorInfo: { name: 'Author' },
        toJSON: () => ({
          courseID: 'COU1',
          authorID: 'COL123',
          authorInfo: { name: 'Author' },
        }),
      };
      CourseRepository.findByIdWithAuthor.mockResolvedValue(mockCourse);
      ParticipateRepository.countByCourse.mockResolvedValue(10);
      ParticipateRepository.countDistinctLearnersByAuthor.mockResolvedValue(50);
      CourseRepository.countByAuthor.mockResolvedValue(3);

      const result = await CourseService.getCourseByID('COU1');

      expect(result.learnersCount).toBe(10);
      expect(result.authorStats).toEqual({
        totalLearners: 50,
        ownedCourses: 3,
      });
    });
  });

  describe('invalidateCourseCache', () => {
    it('should call delCachePattern and delCache', async () => {
      await CourseService.invalidateCourseCache('COU1');

      expect(delCachePattern).toHaveBeenCalledWith('course:list:*');
      expect(delCachePattern).toHaveBeenCalledWith('course:count:*');
      expect(delCache).toHaveBeenCalledWith('course:detail:COU1');
    });
  });
});
