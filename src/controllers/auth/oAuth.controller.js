const { sequelize, User } = require("../../sequelize");
const jwt = require('jsonwebtoken')
const { generateLearnerID } = require('../../utils/generateID')
const { checkNull } = require('../../utils/checkNull');

const accessTokenLifeTime = process.env.ACCESS_TOKEN_LIFETIME || '1d';
const oAuth2 = async (req, res) => {
   const t = await sequelize.transaction();
   try {
      const { email, name, picture, provider, providerId } = req.body;
      if (
         checkNull(email) ||
         checkNull(name) ||
         checkNull(picture) ||
         checkNull(provider) ||
         checkNull(providerId)
      ) {
         await t.rollback();
         return res.status(400).json({ error: "Missing required fields" });
      }

      const image = "https://res.cloudinary.com/dv2izp0a3/image/upload/v1771752241/default-avatar_hnzfdu.jpg";

      const existingUser = await User.findOne({ where: { email }, transaction: t });
      const user = existingUser
      ? existingUser
      : await User.create({
         userID: generateLearnerID(),
         name,
         email,
         image: picture || image,
         provider,
         providerId
        }, { transaction: t });

      const accessToken = jwt.sign(
         {
            username: user.name,
            userID: user.userID,
            userRole: user.role
         },
         process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: accessTokenLifeTime }
      );
      await t.commit();

      return res.status(200).json({
         userID: user.userID,
         name: user.name,
         role: user.role,
         image: user.image,
         accessToken,
         message: "OAuth login success!"
      });
   } catch (err) {
      console.error("OAuth login error:", err);
      res.status(500).json({ error: "Internal server error", details: err.message });
   }
};

module.exports = {
   oAuth2
}
