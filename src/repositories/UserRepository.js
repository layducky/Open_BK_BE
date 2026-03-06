const { User } = require('../sequelize');

const UserRepository = {
  findByPk(userID, options = {}) {
    return User.findByPk(userID, options);
  },

  findOne(where, options = {}) {
    return User.findOne({ where, ...options });
  },
};

module.exports = UserRepository;
