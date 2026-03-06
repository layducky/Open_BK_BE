const EnrollmentService = require('../../services/EnrollmentService');

const courseEnroll = {
  async getEnrolledCourses(req, res) {
    try {
      const userID = req.user.userID;
      const result = await EnrollmentService.getEnrolledCourses(userID);
      if (result === null) return res.status(404).json({ error: 'Learner not found' });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  async enrollCourse(req, res) {
    try {
      const { courseID } = req.params;
      const userID = req.user.userID;
      const result = await EnrollmentService.enrollCourse(userID, courseID);
      if (result.error) return res.status(result.status).json({ error: result.error });
      return res.status(201).json({ message: 'Enrolled in course successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  async deleteEnrolledCourses(req, res) {
    try {
      const { courseID } = req.params;
      const learnerID = req.user.userID;
      if (!learnerID) return res.status(400).json({ message: 'Learner ID is missing!' });

      const result = await EnrollmentService.deleteEnrolledCourses(learnerID, courseID);
      if (result.error) return res.status(result.status).json({ error: result.error });
      return res.status(200).json({ message: 'Deleted learner from course successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },

  async getStats(req, res) {
    try {
      const userID = req.user.userID;
      const role = req.user.userRole;
      if (!userID || !role) {
        return res.status(400).json({ error: 'User information is missing' });
      }

      const result = await EnrollmentService.getStats(userID, role);
      return res.status(200).json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  },
};

module.exports = courseEnroll;
