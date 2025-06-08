const { User, Course, Participate } = require('../../sequelize');
const { generateCourseID } = require('../../utils/generateID');
const {filterNull, checkNull} = require('../../common/ultis');

const CourseCollab = {
  async createCourse(req, res) {
    try {
      const { courseName, image, category, description, price } = req.body;
      const imageUrl = "https://t4.ftcdn.net/jpg/07/77/57/53/360_F_777575393_rZskmeQsWOY8TXBjwjcyBOHamOQfZyHs.jpg";

      if (checkNull({ courseName, imageUrl })) {
        return res.status(400).json({ message: 'Course creation failed, some fields are missing' });
      }

      const courseID = generateCourseID();
      const fieldsToCreate = filterNull({
        courseID,
        authorID: req.user.userID,
        courseName,
        imageUrl,
        category,
        description,
        price
      });

      await Course.create(fieldsToCreate);

      return res.status(201).json({courseID, message: 'Course creation is successful' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

   async getAllOwnedCourses (req, res) {
      try {

         const ownedCourses = await Course.findAll({
            where: {
               authorID: req.user.userID,
            },
            include: {
               model: User,
               as: 'authorInfo',
               attributes: ['name', 'imageUrl'],
            },
          });

         if (ownedCourses.length === 0) {
            return res.status(404).json({ error: 'No owned courses found for this author' });
         }

         return res.status(200).json(ownedCourses );
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },

   async getAllLearners (req, res) {
      try {

         const { courseID } = req.params;

         const course = await Course.findByPk(courseID);
         if (!course) {
            return res.status(404).json({ error: 'Course not found' });
         }

         const learners = await Participate.findAll({
            where: {
               courseID,
            },
         });

         if (learners.length === 0) {
            return res.status(404).json({ error: 'No learners found for this course' });
         }

         return res.status(200).json(learners );
      } catch (err) {
         console.error(err);
         return res.status(500).json({ error: err.message });
      }
   },

async updateCourse(req, res) {
      try {
         const { courseID } = req.params;
         const { courseName, image, category, description, price } = req.body;
         const imageUrl = "https://t4.ftcdn.net/jpg/07/77/57/53/360_F_777575393_rZskmeQsWOY8TXBjwjcyBOHamOQfZyHs.jpg";
         if (checkNull({ courseName, imageUrl, category, description, price })) {
            return res.status(400).json({ message: 'Course update failed, some fields are missing' });
         }
         const course = await Course.findByPk(courseID);
         if (!course) {
            return res.status(404).json({ message: 'Course not found' });
         }
         const fieldsToUpdate = filterNull({
            courseName,
            imageUrl,
            category,
            description,
            price
         });
         await course.update(fieldsToUpdate);


         return res.status(200).json({ message: 'Course update is successful' });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

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
   // async deleteLearnerFromCourse (req, res) {
   //    try {
   //       const { authorID, courseID , learnerID} = req.params;

   //       if (!learnerID) {
   //          return res.status(400).json({ message: 'Collab ID is missing' });
   //       }

   //       const deleted = await Participate.destroy({
   //          where: {
   //             authorID,
   //             courseID,
   //          },
   //       });

   //       if (!deleted) {
   //          return res.status(404).json({ error: 'Learner not found in this course' });
   //       }

   //       return res.status(200).json({ message: 'Deleted learner from course successfully' });
   //    } catch (err) {
   //       console.error(err);
   //       return res.status(500).json({ error: err.message });
   //    }
   // },
}
module.exports = CourseCollab
