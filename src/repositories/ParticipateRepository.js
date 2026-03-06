const { Participate, Course, User, sequelize } = require('../sequelize');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

const ParticipateRepository = {
  findByLearnerWithCourses(learnerID, options = {}) {
    return Participate.findAll({
      where: { learnerID },
      include: [
        {
          model: Course,
          as: 'courseInfo',
          attributes: ['courseName', 'description', 'image', 'category', 'price'],
          include: [
            { model: User, as: 'authorInfo', attributes: ['name', 'image'] },
          ],
        },
      ],
      ...options,
    });
  },

  findByLearnerAndCourse(learnerID, courseID, options = {}) {
    return Participate.findOne({
      where: { learnerID, courseID },
      ...options,
    });
  },

  findOneByLearnerForAuthor(learnerID, authorID, options = {}) {
    return Participate.findOne({
      where: { learnerID },
      include: [
        { model: Course, as: 'courseInfo', where: { authorID }, attributes: [] },
      ],
      ...options,
    });
  },

  findByCourse(courseID, options = {}) {
    return Participate.findAll({
      where: { courseID },
      attributes: options.attributes || undefined,
      ...options,
    });
  },

  countByLearner(learnerID) {
    return Participate.count({ where: { learnerID } });
  },

  countByCourse(courseID) {
    return Participate.count({ where: { courseID } });
  },

  /** Trả về { courseID: count } cho batch - dùng cho getAllCourses */
  async countGroupedByCourse(courseIDs) {
    if (courseIDs.length === 0) return {};
    const { fn, col } = require('sequelize');
    const rows = await Participate.findAll({
      attributes: ['courseID', [fn('COUNT', col('learnerID')), 'count']],
      where: { courseID: { [Op.in]: courseIDs } },
      group: ['courseID'],
      raw: true,
    });
    const result = {};
    for (const r of rows) result[r.courseID] = Number(r.count) || 0;
    return result;
  },

  /** Số learner unique (không tính author) đã enroll vào bất kỳ course nào của author */
  async countDistinctLearnersByAuthor(authorID) {
    const rows = await sequelize.query(
      `SELECT COUNT(DISTINCT p."learnerID") as cnt FROM "Participate" p
       INNER JOIN "Course" c ON p."courseID" = c."courseID" AND c."authorID" = :authorID
       WHERE p."learnerID" != :authorID`,
      { replacements: { authorID }, type: QueryTypes.SELECT }
    );
    const r = rows?.[0];
    return r ? Number(r.cnt) || 0 : 0;
  },

  countByCourseIDs(courseIDs) {
    if (courseIDs.length === 0) return 0;
    return Participate.count({
      distinct: true,
      col: 'courseID',
      where: { courseID: { [Op.in]: courseIDs } },
    });
  },

  countAll() {
    return Participate.count();
  },

  create(fields, options = {}) {
    return Participate.create(fields, options);
  },

  destroy(where, options = {}) {
    return Participate.destroy({ where, ...options });
  },
};

module.exports = ParticipateRepository;
