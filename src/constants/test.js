/**
 * Test domain constants - dùng cho timer, scoring, validation
 */
const SUBMISSION_STATUS = Object.freeze({
  ONGOING: 'ongoing',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  FAILED: 'failed',
});

const USER_TEST_STATUS = Object.freeze({
  ALLOW: 'allow',
  CONTINUE: 'continue',
  CLOSED: 'closed',
  FORBIDDEN: 'forbidden',
});

const QUESTION_CHOICES = Object.freeze(['A', 'B', 'C', 'D', 'NULL']);

module.exports = {
  SUBMISSION_STATUS,
  USER_TEST_STATUS,
  QUESTION_CHOICES,
};
