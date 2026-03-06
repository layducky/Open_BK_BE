const CourseRepository = require('../repositories/CourseRepository');
const ParticipateRepository = require('../repositories/ParticipateRepository');
const UserRepository = require('../repositories/UserRepository');
const { getCache, setCache, delCache, delCachePattern, CACHE_TTL } = require('./cache.service');

const CourseService = {
  async getAllCourses(search, category, priceType, page, limit) {
    const normSearch = (search || '').trim().replace(/\s+/g, ' ');
    const cacheKey = `course:list:${category || 'ALL'}:${priceType || 'ALL'}:${normSearch}:${page ?? 'all'}:${limit ?? 'all'}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const offset = page != null && limit != null ? (page - 1) * limit : undefined;
    const courses = await CourseRepository.findWithFilters(search, category, priceType, { limit, offset });
    if (!courses) return null;

    const courseIDs = courses.map((c) => c.courseID);
    const countMap = await ParticipateRepository.countGroupedByCourse(courseIDs);

    const coursesWithCounts = courses.map((course) => ({
      ...course.toJSON(),
      learnersCount: countMap[course.courseID] ?? 0,
    }));

    if (page != null && limit != null) {
      const countKey = `course:count:${category || 'ALL'}:${priceType || 'ALL'}:${normSearch}`;
      let total = await getCache(countKey);
      if (total == null) {
        total = await CourseRepository.countWithFilters(search, category, priceType);
        await setCache(countKey, total, CACHE_TTL.COURSE_LIST);
      }
      const payload = { courses: coursesWithCounts, total };
      await setCache(cacheKey, payload, CACHE_TTL.COURSE_LIST);
      return payload;
    }

    await setCache(cacheKey, coursesWithCounts, CACHE_TTL.COURSE_LIST);
    return coursesWithCounts;
  },

  async getCourseByID(courseID) {
    const cacheKey = `course:detail:${courseID}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const course = await CourseRepository.findByIdWithAuthor(courseID);
    if (!course) return null;

    const [learnersCount, totalLearnersForAuthor, ownedCourses] = await Promise.all([
      ParticipateRepository.countByCourse(courseID),
      course.authorID ? ParticipateRepository.countDistinctLearnersByAuthor(course.authorID) : 0,
      course.authorID ? CourseRepository.countByAuthor(course.authorID) : 0,
    ]);
    const author = course.authorInfo;
    const payload = {
      ...course.toJSON(),
      learnersCount: learnersCount ?? 0,
      authorStats: {
        totalLearners: totalLearnersForAuthor ?? 0,
        ownedCourses: ownedCourses ?? 0,
      },
    };

    await setCache(cacheKey, payload, CACHE_TTL.COURSE_DETAIL);
    return payload;
  },

  async deleteCourseWithCascade(courseID) {
    const course = await CourseRepository.findById(courseID);
    if (!course) return { error: 'Course not found', status: 404 };

    await ParticipateRepository.destroy({ courseID });
    const deleted = await CourseRepository.destroy(courseID);
    if (!deleted) return { error: 'Failed to delete course', status: 500 };

    await this.invalidateCourseCache(courseID);
    return { success: true };
  },

  async deleteCoursesByAuthor(authorID) {
    const courses = await CourseRepository.findIdsByAuthor(authorID);
    const courseIDs = courses.map((c) => c.courseID);
    for (const courseID of courseIDs) {
      await this.deleteCourseWithCascade(courseID);
    }
  },

  async invalidateCourseCache(courseID) {
    await delCachePattern('course:list:*').catch(() => {});
    await delCachePattern('course:count:*').catch(() => {});
    if (courseID) {
      await delCache(`course:detail:${courseID}`).catch(() => {});
      await delCachePattern(`course:units:${courseID}`).catch(() => {});
    } else {
      await delCachePattern('course:detail:*').catch(() => {});
      await delCachePattern('course:units:*').catch(() => {});
    }
  },
};

module.exports = CourseService;
