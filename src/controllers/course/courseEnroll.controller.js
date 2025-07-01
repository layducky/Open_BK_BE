const { User, Participate, Course } = require('../../sequelize');
const { Unit, Test, UserTest } = require('../../sequelize');
const { sequelize } = require('../../sequelize');


const courseEnroll = {
   async getEnrolledCourses (req, res) {
      const t = await sequelize.transaction(); 
      try {
         const userID = req.user.userID
         const learner = await User.findOne({
            where: { userID },
            transaction: t,
         });
         if (!learner) {
            await t.rollback();
            return res.status(404).json({ error: 'Learner not found' });
         }

         const enrolledCourses = await Participate.findAll({
            where: {
               learnerID: userID,
            },
            include: [
               {
                 model: Course,
                 as: 'courseInfo',
                 attributes: [
                   'courseName', 
                   'description', 
                   'image',
                   'category',
                   'price',
                 ],
                 include: [
                   {
                     model: User,
                     as: 'authorInfo',
                     attributes: ['name', 'image'],
                   },
                 ],
               },
            ],
            transaction: t,
          });
         

         if (enrolledCourses.length === 0) {
            await t.commit(); 
            return res.status(200).json([]);
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
              image: course.image,
              category: course.category,
              price: course.price,
              authorInfo: course.authorInfo,
            };
          });

         await t.commit(); 
         return res.status(200).json( flatCourses );
      } catch (err) {
         return res.status(500).json({ error: err.message });
      }
   },
   async enrollCourse (req, res) {
      const t = await sequelize.transaction(); 
      try {
         const { courseID } = req.params;
         const userID = req.user.userID;
         const learner = await User.findOne({
            where: { userID },
            transaction: t,
         });
         if (!learner) {
            await t.rollback();
            return res.status(404).json({ error: 'Learner not found' });
         }

         const course = await Course.findOne({
            where: { courseID },
            transaction: t,
         });
         if (!course) {
            return res.status(404).json({ error: 'Course not found' });
         }

         const existingEnrollment = await Participate.findOne({
            where: {
               learnerID: userID,
               courseID,
            },
            transaction: t,
         });
         if (existingEnrollment) {
            return res.status(400).json({ error: 'User is already enrolled in this course' });
         }

         await Participate.create({
            learnerID: userID,
            courseID,
         }, {transaction: t});

         const tests = await Test.findAll({
            attributes: ['testID'],
            include: [{
               model: Unit,
               as: 'unit_tests', 
               where: { courseID },
               attributes: [],
            }],
            transaction: t,
         });
         if (tests.length > 0) {
            const userTests = tests.map(test => ({
               userID,
               testID: test.testID
            }));
            await UserTest.bulkCreate(userTests, {
               ignoreDuplicates: true,
               transaction: t,
            });
         }


         await t.commit();
         return res.status(201).json({ message: 'Enrolled in course successfully' });
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },
   async deleteEnrolledCoures (req, res) {
      try {
         const { courseID } = req.params;
         const learnerID = req.user.userID;

         if (!learnerID) {
            return res.status(400).json({ message: 'Learner ID is missing!' });
         }
          const course = await Course.findOne({
            where: { courseID },
          });
          if (!course) {
            return res.status(404).json({ error: 'Course not found!' });
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
