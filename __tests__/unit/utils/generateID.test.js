const {
  generateLearnerID,
  generateCollabID,
  generateCourseID,
  generateUnitID,
  generateTestID,
  generateQuestionID,
  generateDocumentID,
  generateVideoID,
} = require('../../../src/utils/generateID');

describe('generateID utils', () => {
  describe('generateLearnerID', () => {
    it('should return ID starting with LEA and 6 digits', () => {
      const id = generateLearnerID();
      expect(id).toMatch(/^LEA\d{6}$/);
    });
  });

  describe('generateCollabID', () => {
    it('should return ID starting with COL and 6 digits', () => {
      const id = generateCollabID();
      expect(id).toMatch(/^COL\d{6}$/);
    });
  });

  describe('generateCourseID', () => {
    it('should return ID starting with COU and 6 digits', () => {
      const id = generateCourseID();
      expect(id).toMatch(/^COU\d{6}$/);
    });
  });

  describe('generateUnitID', () => {
    it('should return ID with UNI prefix + course number part + 3 digits', () => {
      const id = generateUnitID('COU123456');
      expect(id).toMatch(/^UNI123456\d{3}$/);
    });
  });

  describe('generateTestID', () => {
    it('should return ID starting with TES and digits', () => {
      const id = generateTestID();
      expect(id).toMatch(/^TES\d+$/);
    });
  });

  describe('generateQuestionID', () => {
    it('should return ID with QUE prefix + test number part + 3 digits', () => {
      const id = generateQuestionID('TES12345678');
      expect(id).toMatch(/^QUE12345678\d{3}$/);
    });
  });

  describe('generateDocumentID', () => {
    it('should return ID starting with DOC and digits', () => {
      const id = generateDocumentID();
      expect(id).toMatch(/^DOC\d+$/);
    });
  });

  describe('generateVideoID', () => {
    it('should return ID starting with VID and digits', () => {
      const id = generateVideoID();
      expect(id).toMatch(/^VID\d+$/);
    });
  });
});
