const { User, Participate, Course } = require('../../sequelize');
const { Unit, Test, UserTest } = require('../../sequelize');
const { sequelize } = require('../../sequelize');
const { Op } = require('sequelize');

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
         }, { transaction: t });

         await course.increment('enrolledStudentsCount', { transaction: t });
         await learner.increment('enrolledCoursesCount', { transaction: t });

         const author = await User.findByPk(course.authorID, { transaction: t });
         if (author) {
           const otherEnroll = await Participate.findOne({
             where: { learnerID: userID },
             include: [{ model: Course, as: 'courseInfo', where: { authorID: course.authorID }, attributes: [] }],
             transaction: t,
           });
           if (!otherEnroll) await author.increment('totalEnrolledStudentsCount', { transaction: t });
         }

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
   async deleteEnrolledCourses (req, res) {
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

          const participation = await Participate.findOne({
            where: { learnerID, courseID },
          });
          if (!participation) {
            return res.status(404).json({ error: 'Learner not found in this course' });
          }

          const deleted = await Participate.destroy({
            where: { learnerID, courseID },
          });
          if (!deleted) return res.status(500).json({ error: 'Failed to delete' });

          await course.decrement('enrolledStudentsCount');
          const learner = await User.findByPk(learnerID);
          if (learner) await learner.decrement('enrolledCoursesCount');
          const author = await User.findByPk(course.authorID);
          if (author) {
            const stillEnrolled = await Participate.findOne({
              where: { learnerID },
              include: [{ model: Course, as: 'courseInfo', where: { authorID: course.authorID }, attributes: [] }],
            });
            if (!stillEnrolled) await author.decrement('totalEnrolledStudentsCount');
          }

         return res.status(200).json({ message: 'Deleted learner from course successfully' });
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },
   async getStats (req, res) {
      try {
         const userID = req.user.userID;
         const role = req.user.userRole;
         if (!userID || !role) {
            return res.status(400).json({ error: 'User information is missing' });
         }

         if (role === 'LEARNER') {
            const user = await User.findByPk(userID, { attributes: ['enrolledCoursesCount'] });
            const enrolledCount = user?.enrolledCoursesCount ?? 0;

            return res.status(200).json({
               role,
               enrolledCourses: enrolledCount,
            });
         }

         if (role === 'COLLAB') {
            const user = await User.findByPk(userID, {
               attributes: ['createdCoursesCount', 'totalEnrolledStudentsCount'],
            });
            const ownedCourses = (user?.createdCoursesCount ?? 0);
            const totalLearners = (user?.totalEnrolledStudentsCount ?? 0);
            const courseIDs = (await Course.findAll({
               where: { authorID: userID },
               attributes: ['courseID'],
            })).map((c) => c.courseID);
            const enrolledCourses = courseIDs.length === 0 ? 0 : await Participate.count({
               distinct: true,
               col: 'courseID',
               where: { courseID: { [Op.in]: courseIDs } },
            });

            return res.status(200).json({
               role,
               enrolledCourses,
               totalLearners,
               ownedCourses,
            });
         }

         const enrolledCount = await Participate.count();

         return res.status(200).json({
            role,
            enrolledCourses: enrolledCount,
         });
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },
}
module.exports = courseEnroll
