// controllers/authController.js
const { sequelize, User } = require("../../sequelize");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { generateLearnerID } = require('../../utils/generateID')

const accessTokenLifeTime = process.env.ACCESS_TOKEN_LIFETIME || '1d';
// sign up
const signUp = async (req, res) => {
   const t = await sequelize.transaction();
   try {
      const { name, email, password } = req.body

      const userID = generateLearnerID()
      const image = "https://res.cloudinary.com/dv2izp0a3/image/upload/v1771752241/default-avatar_hnzfdu.jpg"

      const dupplicate = await User.findOne({ where: { email } })
      if (dupplicate) return res.status(401).json({ ERROR: 'Email is registered' })

      const hashpwd = await bcrypt.hash(password, 10)

      const newUser = await User.create({ userID, name, email, password: hashpwd, image, provider: 'credentials'}, { transaction: t })
      // create access, refresh token
      const accessToken = jwt.sign(
         { "username": newUser.name, "userID": newUser.userID, "userRole": newUser.role },
         process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: accessTokenLifeTime }
      )

      // const refreshToken = jwt.sign(
      //    { name: newUser.name, id: newUser.id, role: newUser.role },
      //    process.env.REFRESH_TOKEN_SECRET,
      //    { expiresIn: '1d' }
      // )

      // res.cookie('accessToken', accessToken, {
      //    httpOnly: true,
      //    secure: true,
      //    maxAge: 24 * 60 * 60 * 1000,
      //    sameSite: 'Lax',
      //    partitioned: true
      // })

      // store refresh token in cookies
      // res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
      // pass accessToken to frontend (client-side) for later API calls
      const role = "LEARNER"
      await t.commit()
      return res.status(200).json({userID, name, role, image: image, accessToken, message: 'Register successfully!'})

   } catch (err) {
      return res.status(500).json({ err: 'Error during registration', details: err.message })
   }
}

// log in
const logIn = async (req, res) => {
   try {
      const { email, password } = req.body
      const existUser = await User.findOne({ where: { email } })
      if (!existUser) return res.status(401).json({ ERROR: 'Email is not registered' })

      if (existUser.provider !== 'credentials') {
         return res.status(403).json({ ERROR: 'Please log in using your registered provider.' })
      }

      const isPasswordCorrect = await bcrypt.compare(password, existUser.password)
      if (!isPasswordCorrect) return res.status(404).json({ message: 'Password is incorrect' })
      
      const accessToken = jwt.sign(
         { "username": existUser.name, "userID": existUser.userID, "userRole": existUser.role },
         process.env.ACCESS_TOKEN_SECRET,
         { expiresIn: accessTokenLifeTime }
      )
   
      // const refreshToken = jwt.sign(
      //    { "username": existUser.name, "userID": existUser.userID, "userRole": existUser.role },
      //    process.env.REFRESH_TOKEN_SECRET,
      //    { expiresIn: '1d' }
      // )

      // res.cookie('accessToken', accessToken, {
      //    httpOnly: true,   
      //    secure: true,
      //    maxAge: 24 * 60 * 60 * 1000,
      //    sameSite: 'Lax',
      //    partitioned: true
      // })

      
      const userID = existUser.userID;
      const name = existUser.name;
      const role = existUser.role;
      const image = existUser.image;
      return res.status(200).json({ userID, name, role, image, accessToken, message: 'Login successfully!' })

   } catch (err) {
      console.error('Login error:', err)
      return res.status(500).json({ err: 'Error during login', details: err.message })
   }
}

const logOut = async (req, res) => {
   try {
      // Xóa cookie chứa accessToken
      res.clearCookie('accessToken', {
         httpOnly: true,
         secure: true,
         sameSite: 'Lax',
      })

      res.status(200).json({ message: 'Logged out successfully!' })
   } catch (err) {
      res.status(500).json({ error: 'Error during logout', err })
   }
}


module.exports = {
   signUp,
   logIn,
   logOut
}
