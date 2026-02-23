const { Course, User, Participate } = require('../../sequelize');
const { filterNull, checkNull } = require('../../utils/checkNull');
const { Op } = require('sequelize');

const CourseController = {

  async getAllCourses(req, res) {
    try {
      const { search, category, priceType } = req.query;
      const filters = [];

      if (category && category !== 'ALL') {
        filters.push({ category });
      }

      if (priceType === 'FREE') {
        filters.push({
          [Op.or]: [
            { price: 'Free' },
            { price: '0' },
            { price: '0.0' },
            { price: '0.00' },
          ],
        });
      } else if (priceType === 'PAID') {
        filters.push({
          price: {
            [Op.notIn]: ['Free', '0', '0.0', '0.00'],
          },
        });
      }

      if (search && search.trim() !== '') {
        const query = search.trim();
        filters.push({
          [Op.or]: [
            { courseName: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } },
          ],
        });
      }

      const where =
        filters.length > 0
          ? {
              [Op.and]: filters,
            }
          : undefined;

      const courses = await Course.findAll({
        where,
        include: {
          model: User,
          as: 'authorInfo',
          attributes: ['name', 'image'],
        },
      });
      if (!courses) return res.status(404).json({ message: 'No course is found' });

      const coursesWithCounts = courses.map((course) => ({
        ...course.toJSON(),
        learnersCount: course.enrolledStudentsCount ?? 0,
      }));

      res.status(200).json(coursesWithCounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = [
        { value: 'MATH', label: 'Math' },
        { value: 'ENGLISH', label: 'English' },
        { value: 'CODE', label: 'Code' },
        { value: 'ART', label: 'Art' },
        { value: 'NONE', label: 'None' },
      ];
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCourseByID(req, res) {
    try {
      const { courseID } = req.params;
      const course = await Course.findOne({
        where: { courseID },
        include: {
          model: User,
          as: 'authorInfo',
          attributes: ['name', 'image', 'createdCoursesCount', 'totalEnrolledStudentsCount'],
        },
      });
      if (!course) return res.status(404).json({ message: 'No course is found' });

      const learnersCount = course.enrolledStudentsCount ?? 0;
      const author = course.authorInfo;
      const payload = {
        ...course.toJSON(),
        learnersCount,
        authorStats: {
          totalLearners: author?.totalEnrolledStudentsCount ?? 0,
          ownedCourses: author?.createdCoursesCount ?? 0,
        },
      };

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

      const course = await Course.findByPk(courseID);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const author = await User.findByPk(newAuthorID);
      if (!author) {
        return res.status(404).json({ error: 'Author not found' });
      }

      if (author.role !== 'COLLAB') {
        return res.status(403).json({ error: 'You do not have permission to update this course, role must be COLLAB' });
      }
      if (course.authorID !== newAuthorID) {
        return res.status(403).json({ error: 'You are not the author of this course and cannot update it' });
      }

      const [updatedRowsCount] = await Course.update(fieldsToUpdate, {
        where: { courseID: courseID },
      });
      if (updatedRowsCount === 0) {
        return res.status(400).json({ error: 'No changes were made' });
      }

      res.status(200).json({ message: 'Updated course successfully' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  //DELETE
  async deleteCourse (req, res) {
    try {
      const { courseID }  = req.params;
      deleted = await Course.destroy({
        where:{
          courseID,
        },
      })

      if(!deleted) return res.status(404).json({ error: 'Course not found' });

      res.status(200).json({ message: 'Deleted course successfully' });
    }catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  async deleteAllCourses(req, res) {
    try {
      const deleted = await Course.destroy({ where: {} });
      if (!deleted) return res.status(404).json({ error: 'No courses found to delete' });
      res.status(200).json({ message: 'All courses deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};


module.exports = CourseController