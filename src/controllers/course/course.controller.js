const CourseRepository = require('../../repositories/CourseRepository');
const CourseService = require('../../services/CourseService');
const { filterNull, checkNull } = require('../../utils/checkNull');
const { getCache, setCache, delCache, delCachePattern, CACHE_TTL } = require('../../services/cache.service');

const CourseController = {

  async getAllCourses(req, res) {
    try {
      const { search, category, priceType, page, limit } = req.query;
      const pageNum = page ? parseInt(page, 10) : undefined;
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const courses = await CourseService.getAllCourses(search, category, priceType, pageNum, limitNum);
      if (!courses) return res.status(404).json({ message: 'No course is found' });
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategories(req, res) {
    try {
      const cacheKey = 'course:categories';
      const cached = await getCache(cacheKey);
      if (cached) return res.status(200).json(cached);

      const categories = [
        { value: 'MATH', label: 'Math' },
        { value: 'ENGLISH', label: 'English' },
        { value: 'CODE', label: 'Code' },
        { value: 'ART', label: 'Art' },
        { value: 'NONE', label: 'None' },
      ];
      await setCache(cacheKey, categories, CACHE_TTL.CATEGORIES);
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCourseByID(req, res) {
    try {
      const { courseID } = req.params;
      const payload = await CourseService.getCourseByID(courseID);
      if (!payload) return res.status(404).json({ message: 'No course is found' });
      res.status(200).json(payload);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  async updateCourse(req, res) {
    try {
      const courseID = req.params.courseID;
      const {
        description: newDescription,
        price: newPrice,
        courseName: newCourseName,
        authorID: newAuthorID,
      } = req.body;

      const fieldsToUpdate = filterNull({
        description: newDescription,
        price: newPrice,
        courseName: newCourseName,
      });

      const course = await CourseRepository.findById(courseID);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const UserRepository = require('../../repositories/UserRepository');
      const author = await UserRepository.findByPk(newAuthorID);
      if (!author) {
        return res.status(404).json({ error: 'Author not found' });
      }

      if (author.role !== 'COLLAB') {
        return res.status(403).json({ error: 'You do not have permission to update this course, role must be COLLAB' });
      }
      if (course.authorID !== newAuthorID) {
        return res.status(403).json({ error: 'You are not the author of this course and cannot update it' });
      }

      const [updatedRowsCount] = await CourseRepository.update(courseID, fieldsToUpdate);
      if (updatedRowsCount === 0) {
        return res.status(400).json({ error: 'No changes were made' });
      }

      await CourseService.invalidateCourseCache(courseID);

      res.status(200).json({ message: 'Updated course successfully' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  //DELETE
  async deleteCourse (req, res) {
    try {
      const { courseID }  = req.params;
      const deleted = await CourseRepository.destroy(courseID);

      if(!deleted) return res.status(404).json({ error: 'Course not found' });

      await CourseService.invalidateCourseCache(courseID);

      res.status(200).json({ message: 'Deleted course successfully' });
    }catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteAllCourses(req, res) {
    try {
      const deleted = await CourseRepository.destroyAll();
      if (!deleted) return res.status(404).json({ error: 'No courses found to delete' });
      await CourseService.invalidateCourseCache();
      res.status(200).json({ message: 'All courses deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};


module.exports = CourseController