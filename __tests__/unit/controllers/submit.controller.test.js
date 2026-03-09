const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

const mockSubmissionFindOne = jest.fn();
const mockSubmissionFindByPk = jest.fn();
const mockSubmissionCreate = jest.fn();
const mockSubmissionMax = jest.fn();

const mockUserTestFindOne = jest.fn();
const mockUserTestUpdate = jest.fn();

jest.mock('../../../src/sequelize', () => ({
  sequelize: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  },
  Submission: {
    findOne: (...args) => mockSubmissionFindOne(...args),
    findByPk: (...args) => mockSubmissionFindByPk(...args),
    create: (...args) => mockSubmissionCreate(...args),
    max: (...args) => mockSubmissionMax(...args),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  UserTest: {
    findOne: (...args) => mockUserTestFindOne(...args),
    update: (...args) => mockUserTestUpdate(...args),
  },
  Test: {},
  QuesAns: {
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

const mockFindQuestionsByTestAndIds = jest.fn();
const mockUpsertQuesAns = jest.fn();

jest.mock('../../../src/repositories/SubmissionRepository', () => ({
  findQuestionsByTestAndIds: (...args) => mockFindQuestionsByTestAndIds(...args),
  upsertQuesAns: (...args) => mockUpsertQuesAns(...args),
}));

const SubmitController = require('../../../src/controllers/users/test/submit.controller');

describe('submit.controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {},
      body: {},
      user: { userID: 'LEA123' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createSubmit', () => {
    it('should return 404 when userTest not found', async () => {
      req.params = { userTestID: 'UT999' };
      mockUserTestFindOne.mockResolvedValue(null);

      await SubmitController.createSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'UserTest not found' });
    });

    it('should return 409 when ongoing submission exists', async () => {
      req.params = { userTestID: 'UT1' };
      const mockUserTest = {
        userTestID: 'UT1',
        testID: 'TES1',
        update: jest.fn().mockResolvedValue(undefined),
        user_tests: { duration: 60 },
      };
      mockUserTestFindOne.mockResolvedValue(mockUserTest);
      mockSubmissionFindOne.mockResolvedValue({
        submissionID: 'SUB1',
        status: 'ongoing',
      });

      await SubmitController.createSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'ONGOING_SUBMISSION',
          message: 'You have an ongoing submission. End it to start a new one.',
          submissionID: 'SUB1',
        })
      );
    });

    it('should return 201 on success', async () => {
      req.params = { userTestID: 'UT1' };
      const mockUserTest = {
        userTestID: 'UT1',
        testID: 'TES1',
        update: jest.fn().mockResolvedValue(undefined),
        user_tests: { duration: 60 },
      };
      mockUserTestFindOne.mockResolvedValue(mockUserTest);
      mockSubmissionFindOne.mockResolvedValue(null);
      mockSubmissionMax.mockResolvedValue(0);
      mockSubmissionCreate.mockResolvedValue({
        submissionID: 'SUB1',
        createdAt: new Date(),
      });

      await SubmitController.createSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionID: 'SUB1',
          duration: 60,
          message: 'Examination start now!',
        })
      );
    });
  });

  describe('updateSubmit', () => {
    it('should return 404 when submission not found', async () => {
      req.params = { submissionID: 'SUB999' };
      req.body = { status: 'submitted', submission: [] };
      mockSubmissionFindByPk.mockResolvedValue(null);

      await SubmitController.updateSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Submission not found',
      });
    });

    it('should return 403 when studentID does not match', async () => {
      req.params = { submissionID: 'SUB1' };
      req.body = { status: 'submitted', submission: [{ questionID: 'Q1', selectedAns: 'A' }] };
      mockSubmissionFindByPk.mockResolvedValue({
        submissionID: 'SUB1',
        studentID: 'LEA999',
        status: 'ongoing',
        createdAt: new Date(),
        test_submissions: { numQuests: 1, duration: 60 },
        update: jest.fn(),
        userTestID: 'UT1',
      });

      await SubmitController.updateSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
    });

    it('should return 400 when already submitted/graded', async () => {
      req.params = { submissionID: 'SUB1' };
      req.body = { status: 'submitted', submission: [{ questionID: 'Q1', selectedAns: 'A' }] };
      mockSubmissionFindByPk.mockResolvedValue({
        submissionID: 'SUB1',
        studentID: 'LEA123',
        status: 'submitted',
        createdAt: new Date(),
        test_submissions: {},
        update: jest.fn(),
        userTestID: 'UT1',
      });

      await SubmitController.updateSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'The test is completed and cannot be redone.',
      });
    });

    it('should return 400 when submission is not array', async () => {
      req.params = { submissionID: 'SUB1' };
      req.body = { status: 'draft', submission: null };
      mockSubmissionFindByPk.mockResolvedValue({
        submissionID: 'SUB1',
        studentID: 'LEA123',
        status: 'ongoing',
        createdAt: new Date(Date.now() - 60000),
        test_submissions: { numQuests: 2, duration: 60 },
        update: jest.fn().mockResolvedValue(undefined),
        userTestID: 'UT1',
      });

      await SubmitController.updateSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid submission data',
      });
    });

    it('should return 403 when deadline exceeded', async () => {
      req.params = { submissionID: 'SUB1' };
      req.body = { status: 'submitted', submission: [{ questionID: 'Q1', selectedAns: 'A' }] };
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
      mockSubmissionFindByPk.mockResolvedValue({
        submissionID: 'SUB1',
        studentID: 'LEA123',
        status: 'ongoing',
        createdAt: pastDate,
        test_submissions: { numQuests: 1, duration: 30 },
        update: jest.fn(),
        userTestID: 'UT1',
      });

      await SubmitController.updateSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Deadline exceeded' });
    });

    it('should return 200 on success', async () => {
      req.params = { submissionID: 'SUB1' };
      req.body = {
        status: 'submitted',
        submission: [{ questionID: 'Q1', selectedAns: 'A' }],
      };
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      mockSubmissionFindByPk.mockResolvedValue({
        submissionID: 'SUB1',
        studentID: 'LEA123',
        testID: 'TES1',
        status: 'ongoing',
        createdAt: new Date(),
        userTestID: 'UT1',
        test_submissions: { numQuests: 1, duration: 60 },
        update: mockUpdate,
      });
      mockFindQuestionsByTestAndIds.mockResolvedValue([
        { questionID: 'Q1', correctAns: 'A' },
      ]);
      mockUpsertQuesAns.mockResolvedValue(undefined);
      mockUserTestUpdate.mockResolvedValue(undefined);

      await SubmitController.updateSubmit(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Submission updated successfully!',
          totalScore: 100,
          numRightAns: 1,
          numQuests: 1,
        })
      );
    });
  });
});
