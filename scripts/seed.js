require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pg = require("pg");
const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("../src/models/user.model");

pg.defaults.ssl = process.env.SSL || false;
const DB_DIALECT = process.env.DB_DIALECT || "postgres";
const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: DB_DIALECT,
  logging: false,
});

const User = UserModel(sequelize, DataTypes);

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

(async () => {
  try {
    await sequelize.authenticate();
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log("Admin account already exists:", ADMIN_EMAIL);
    } else {
      await User.create({
        userID: "ADM001",
        name: "Admin",
        email: ADMIN_EMAIL,
        password: bcrypt.hashSync(ADMIN_PASSWORD, 10),
        image: "https://res.cloudinary.com/dv2izp0a3/image/upload/v1771752241/default-avatar_hnzfdu.jpg",
        provider: "credentials",
        role: "ADMIN",
        providerId: "admin-credentials-default",
      });
      console.log("Default admin account created:", ADMIN_EMAIL);
    }
    console.log("Seed completed.");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
})();
