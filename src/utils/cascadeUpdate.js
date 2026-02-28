/**
 * Cascade update timestamps when nested entities change.
 * Updates updatedAt for the entity and all its parents (test -> unit -> course).
 */
const { Test, Unit, Course, Document } = require('../sequelize');

/**
 * Touch Test, Unit, Course when a question changes
 */
async function cascadeUpdateFromQuestion(questionID) {
  const { Question } = require('../sequelize');
  const question = await Question.findByPk(questionID);
  if (!question) return;
  await cascadeUpdateFromTest(question.testID);
}

/**
 * Touch Test, Unit, Course when a test changes
 */
async function cascadeUpdateFromTest(testID) {
  const test = await Test.findByPk(testID);
  if (!test) return;
  const now = new Date();
  try {
    await Test.update({ contentUpdatedAt: now }, { where: { testID } });
  } catch (err) {
    console.error('cascadeUpdateFromTest error:', err.message);
  }
  await cascadeUpdateFromUnit(test.unitID);
}

/**
 * Touch Unit, Course when a document changes
 */
async function cascadeUpdateFromDocument(documentID) {
  const document = await Document.findByPk(documentID);
  if (!document) return;
  await cascadeUpdateFromUnit(document.unitID);
}

/**
 * Touch Unit, Course when a unit changes
 */
async function cascadeUpdateFromUnit(unitID) {
  const unit = await Unit.findByPk(unitID);
  if (!unit) return;
  const now = new Date();
  try {
    await Unit.update({ contentUpdatedAt: now }, { where: { unitID } });
  } catch (err) {
    console.error('cascadeUpdateFromUnit error:', err.message);
  }
  await cascadeUpdateFromCourse(unit.courseID);
}

/**
 * Touch Course when a course changes
 */
async function cascadeUpdateFromCourse(courseID) {
  const now = new Date();
  try {
    await Course.update({ contentUpdatedAt: now }, { where: { courseID } });
  } catch (err) {
    console.error('cascadeUpdateFromCourse error:', err.message);
  }
}

module.exports = {
  cascadeUpdateFromQuestion,
  cascadeUpdateFromTest,
  cascadeUpdateFromDocument,
  cascadeUpdateFromUnit,
  cascadeUpdateFromCourse,
};
