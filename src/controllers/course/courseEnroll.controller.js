const { User, Participate, Course } = require('../../sequelize');


const courseEnroll = {
   async getEnrolledCourses (req, res) {
      try {
         const { learnerID } = req.params;
         const learner = await User.findOne({
            where: {
               userID: learnerID,
            },
         });
         if (!learner) {
            return res.status(404).json({ error: 'Learner not found' });
         }

         const enrolledCourses = await Participate.findAll({
            where: {
               learnerID,
            },
            include: [
               {
                  model: Course,
                  as: 'courseInfo',
                  attributes: [
                     'courseName', 
                     'description', 
                     'imageUrl',
                     'category',
                     'price',
                  ],
                  include: [
                     {
                        model: User,
                        as: 'authorInfo',
                        attributes: ['name', 'imageUrl'],
                     },
                  ],
               },
            ],
         });
         

         if (enrolledCourses.length === 0) {
            return res.status(404).json({ error: 'No enrolled courses founded' });
         }
         const flatCourses = enrolledCourses.map(enrolled => {
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
              imageUrl: course.imageUrl,
              category: course.category,
              price: course.price,
              authorInfo: course.authorInfo,
            };
          });

         return res.status(200).json( flatCourses );
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },
   async enrollCourse (req, res) {
      try {
         const { learnerID, courseID } = req.body;
         const learner = await User.findOne({
            where: {
               userID: learnerID,
            },
         });
         if (!learner) {
            return res.status(404).json({ error: 'Learner not found' });
         }

         const course = await Course.findOne({
            where: {
               courseID,
            },
         });
         if (!course) {
            return res.status(404).json({ error: 'Course not found' });
         }

         const existingEnrollment = await Participate.findOne({
            where: {
               learnerID,
               courseID,
            },
         });
         if (existingEnrollment) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
         }

         await Participate.create({
            learnerID,
            courseID,
         });

         return res.status(201).json({ message: 'Enrolled in course successfully' });
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },
   async deleteEnrolledCoures (req, res) {
      try {
         const { learnerID, courseID } = req.params;

         if (!learnerID) {
            return res.status(400).json({ message: 'Learner ID is missing' });
         }

         const deleted = await Participate.destroy({
            where: {
               learnerID,
               courseID,
            },
         });

         if (!deleted) {
            return res.status(404).json({ error: 'Learner not found in this course' });
         }

         return res.status(200).json({ message: 'Deleted learner from course successfully' });
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },
}
module.exports = courseEnroll
