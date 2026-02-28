const generateLearnerID = () => {
  const randomID = Math.floor(100000 + Math.random() * 900000);
  return `LEA${randomID}`;
};
const generateCollabID = () => {
  const randomID = Math.floor(100000 + Math.random() * 900000);
  return `COL${randomID}`;
};

const generateCourseID = () => {
  const randomID = Math.floor(100000 + Math.random() * 900000); 
  return `COU${randomID}`;
};

const generateUnitID = (courseID) => {
  const numberPart = courseID.match(/\d+/)[0];
  const randomID = Math.floor(100 + Math.random() * 900);
  return `UNI${numberPart}${randomID}`;
};

const generateTestID = () => {
  const randomID = Math.floor(100 + Math.random() * 90000000);
  return `TES${randomID}`;
};

const generateQuestionID = (testID) => {
  const numberPart = testID.match(/\d+/)[0];
  const randomID = Math.floor(100 + Math.random() * 900);
  return `QUE${numberPart}${randomID}`;
};

const generateDocumentID = () => {
  const randomID = Math.floor(100 + Math.random() * 90000000);
  return `DOC${randomID}`;
};

module.exports = {
  generateLearnerID,
  generateCollabID,
  generateCourseID,
  generateTestID,
  generateUnitID,
  generateQuestionID,
  generateDocumentID
};
