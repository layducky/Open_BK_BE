require('dotenv').config();
const jwt = require('jsonwebtoken')


//verify JWT// middleware for veryfing JWT
const verifyJWT = (req, res, next) => {
   const token = req.cookies.accessToken;
   
   if (token) {

      jwt.verify(
         token,
         process.env.ACCESS_TOKEN_SECRET,
         (err, decoded) => {
            if (err) { // Invalid access token
               return res.status(401).json({ message: 'Invalid or expired token, please log in again' });
            } else {
               // Access token is valid
               req.user = {
                  name: decoded.name,
                  id: decoded.id,
                  role: decoded.role
               };
               next(); 
            }
         }
      );
   } else {
      // No token in Authorization header
      return res.status(401).json({ message: 'Unauthorized, please log in' });
   }
};


module.exports = verifyJWT
