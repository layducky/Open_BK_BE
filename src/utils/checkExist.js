const { User } = require('../sequelize');

const checkExistByUserID = async ( res, userID ) => {
   try {
   } catch (error) {
      throw new Error(`Error checking existence: ${error.message}`);
   }
   
}
module.exports = checkExistByUserID;