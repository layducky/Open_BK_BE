/**
 * Kiểm tra quyền truy cập course: enrolled (LEARNER) | author (COLLAB) | ADMIN
 * Dùng cho course content, units, tests - không lộ thông tin ngoài phạm vi
 */
const { Course, Participate, Unit, Test, Question } = require('../sequelize');

const checkCourseAccess = async (req, res, next) => {
  try {
    let { courseID } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    if (!courseID && (req.params.unitID || req.params.unitId)) {
      const uid = req.params.unitID || req.params.unitId;
      const unit = await Unit.findByPk(uid, { attributes: ['courseID'] });
      if (!unit) return res.status(404).json({ message: 'Unit not found' });
      courseID = unit.courseID;
    }
    if (!courseID && req.params.testID) {
      const test = await Test.findByPk(req.params.testID, {
        include: [{ model: Unit, as: 'unit_tests', attributes: ['courseID'] }],
      });
      courseID = test?.unit_tests?.courseID ?? null;
    }
    if (!courseID && req.params.questionID) {
      const question = await Question.findByPk(req.params.questionID, { attributes: ['testID'] });
      if (question) {
        const test = await Test.findByPk(question.testID, {
          include: [{ model: Unit, as: 'unit_tests', attributes: ['courseID'] }],
        });
        courseID = test?.unit_tests?.courseID ?? null;
      }
    }
    if (!courseID) return res.status(400).json({ message: 'Course ID required' });

    const role = user.userRole;
    if (role === 'ADMIN') return next();

    const course = await Course.findByPk(courseID, { attributes: ['courseID', 'authorID'] });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (role === 'COLLAB' && course.authorID === user.userID) return next();

    const enrolled = await Participate.findOne({
      where: { courseID, learnerID: user.userID },
    });
    if (enrolled) return next();

    return res.status(403).json({ message: 'You must enroll in this course to access this content' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify course access' });
  }
};

module.exports = checkCourseAccess;
