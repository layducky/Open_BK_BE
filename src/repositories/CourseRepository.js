const { Course, User } = require('../sequelize');
const { Op } = require('sequelize');

const CourseRepository = {
  findWithFilters(search, category, priceType, options = {}) {
    const { limit, offset } = options;
    const filters = [];
    if (category && category !== 'ALL') filters.push({ category });
    if (priceType === 'FREE') {
      filters.push({
        [Op.or]: [{ price: 'Free' }, { price: '0' }, { price: '0.0' }, { price: '0.00' }],
      });
    } else if (priceType === 'PAID') {
      filters.push({ price: { [Op.notIn]: ['Free', '0', '0.0', '0.00'] } });
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
    const where = filters.length > 0 ? { [Op.and]: filters } : undefined;
    return Course.findAll({
      where,
      include: { model: User, as: 'authorInfo', attributes: ['name', 'image'] },
      limit,
      offset,
    });
  },

  countWithFilters(search, category, priceType) {
    const filters = [];
    if (category && category !== 'ALL') filters.push({ category });
    if (priceType === 'FREE') {
      filters.push({
        [Op.or]: [{ price: 'Free' }, { price: '0' }, { price: '0.0' }, { price: '0.00' }],
      });
    } else if (priceType === 'PAID') {
      filters.push({ price: { [Op.notIn]: ['Free', '0', '0.0', '0.00'] } });
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
    const where = filters.length > 0 ? { [Op.and]: filters } : undefined;
    return Course.count({ where });
  },

  findById(courseID, options = {}) {
    return Course.findByPk(courseID, options);
  },

  findByIdWithAuthor(courseID, authorAttrs = ['name', 'image']) {
    return Course.findOne({
      where: { courseID },
      include: { model: User, as: 'authorInfo', attributes: authorAttrs },
    });
  },

  findByAuthor(authorID) {
    return Course.findAll({
      where: { authorID },
      include: { model: User, as: 'authorInfo', attributes: ['name', 'image'] },
    });
  },

  findIdsByAuthor(authorID) {
    return Course.findAll({ where: { authorID }, attributes: ['courseID'] });
  },

  countByAuthor(authorID) {
    return Course.count({ where: { authorID } });
  },

  create(fields) {
    return Course.create(fields);
  },

  update(courseID, fields) {
    return Course.update(fields, { where: { courseID } });
  },

  destroy(courseID) {
    return Course.destroy({ where: { courseID } });
  },

  destroyAll() {
    return Course.destroy({ where: {} });
  },
};

module.exports = CourseRepository;
