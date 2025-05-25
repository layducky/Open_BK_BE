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

const generateQuestionID = (unitID) => {
  const numberPart = unitID.match(/\d+/)[0];
  const randomID = Math.floor(100 + Math.random() * 900);
  return `QUE${numberPart}${randomID}`;
};

module.exports = {
  generateLearnerID,
  generateCollabID,
  generateCourseID,
  generateUnitID,
  generateQuestionID
};
