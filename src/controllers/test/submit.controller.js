// const { User,  } = require('../../sequelize');
// const { generateCourseID } = require('../../utils/generateID');
// const {filterNull, checkNull} = require('../../common/ultis');

// export const SubmitController = {
//     async createSubmit(req, res) {
//         try {
//             const { authorID, courseID, submitContent } = req.body;

//             if (checkNull({ authorID, courseID, submitContent })) {
//                 return res.status(400).json({ message: 'Submit creation failed, some fields are missing' });
//             }

//             const author = await User.findOne({ where: { userID: authorID } });
//             if (!author) {
//                 return res.status(404).json({ message: 'Author not found' });
//             }

//             const course = await Course.findOne({ where: { courseID } });
//             if (!course) {
//                 return res.status(404).json({ message: 'Course not found' });
//             }

//             const submitID = generateCourseID();
//             const fieldsToCreate = filterNull({
//                 submitID,
//                 authorID,
//                 courseID,
//                 submitContent
//             });

//             await Participate.create(fieldsToCreate);

//             return res.status(201).json({submitID, message: 'Submit creation is successful' });

//         } catch (error) {
//             res.status(500).json({ error: error.message });
//         }
//     }
// }