require('dotenv').config();
const jwt = require('jsonwebtoken');
const checkExistByUserID = require('../utils/checkExist');
const { User } = require('../sequelize');
// Verify JWT middleware
const verifyJWT = (allowedRoles) => {
   return async (req, res, next) => {
      const token = req.cookies.accessToken;

      if (!token) {
         return res.status(401).json({ message: 'Unauthorized, please log in' });
      }
      try{
         const decoded = jwt.verify( token, process.env.ACCESS_TOKEN_SECRET);
         
         if (!allowedRoles.includes(decoded.userRole)) {
            return res.status(403).json({
               message: `Access forbidden: Requires one of ${allowedRoles.join(', ')} roles`,
            });
         }
         
         req.user = {
            username: decoded.username,
            userID: decoded.userID,
            userRole: decoded.userRole,
         };
         
         const user = await User.findByPk(req.user.userID);
         if (!user) {
            return res.status(404).json({ message: `User not found` });
         }
         next(); 
      } catch (err) {
         // Handle specific JWT errors
         if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired, please log in again' });
         }
         if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token, please log in again' });
         }
         return res.status(500).json({ message: err.message || 'Authentication error' });
      }   
   }
};


module.exports = {
   verifyJWT
};
