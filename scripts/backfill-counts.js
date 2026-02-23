/**
 * One-time backfill for enrolledStudentsCount, enrolledCoursesCount,
 * createdCoursesCount, totalEnrolledStudentsCount.
 * Run: node scripts/backfill-counts.js (or node path/to/backfill-counts.js from project root)
 */
const path = require('path');
const fs = require('fs');

function findProjectRoot(dir) {
  const candidate = path.join(dir, 'package.json');
  if (fs.existsSync(candidate)) return dir;
  const parent = path.dirname(dir);
  if (parent === dir) throw new Error('Project root (package.json) not found');
  return findProjectRoot(parent);
}

const projectRoot = findProjectRoot(__dirname);
require('dotenv').config({ path: path.join(projectRoot, '.env') });

const { Op } = require('sequelize');
const { sequelize, User, Course, Participate } = require(path.join(projectRoot, 'src', 'sequelize.js'));

async function backfill() {
  try {
    await sequelize.authenticate();

    // Course.enrolledStudentsCount
    const courses = await Course.findAll({ attributes: ['courseID'] });
    for (const c of courses) {
      const count = await Participate.count({ where: { courseID: c.courseID } });
      await Course.update(
        { enrolledStudentsCount: count },
        { where: { courseID: c.courseID } }
      );
    }
    console.log('Course.enrolledStudentsCount backfilled');

    // User.enrolledCoursesCount (learners)
    const users = await User.findAll({ attributes: ['userID'] });
    for (const u of users) {
      const count = await Participate.count({ where: { learnerID: u.userID } });
      await User.update(
        { enrolledCoursesCount: count },
        { where: { userID: u.userID } }
      );
    }
    console.log('User.enrolledCoursesCount backfilled');

    // User.createdCoursesCount & totalEnrolledStudentsCount (collabs)
    const courseRows = await Course.findAll({ attributes: ['authorID'] });
    const authorIDs = [...new Set(courseRows.map((r) => r.authorID))];
    for (const authorID of authorIDs) {
      const owned = await Course.count({ where: { authorID } });
      const courseIDs = (await Course.findAll({ where: { authorID }, attributes: ['courseID'] }))
        .map((c) => c.courseID);
      const totalLearners =
        courseIDs.length === 0
          ? 0
          : await Participate.count({
              distinct: true,
              col: 'learnerID',
              where: { courseID: { [Op.in]: courseIDs } },
            });
      await User.update(
        { createdCoursesCount: owned, totalEnrolledStudentsCount: totalLearners },
        { where: { userID: authorID } }
      );
    }
    console.log('User.createdCoursesCount & totalEnrolledStudentsCount backfilled');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

backfill();
