const mockUserFindOne = jest.fn();
const mockUserFindAll = jest.fn();
const mockUserFindByPk = jest.fn();
const mockUserCreate = jest.fn();
const mockUserDestroy = jest.fn();
const mockUserUpdate = jest.fn();

jest.mock('../../../src/sequelize', () => ({
  User: {
    findOne: (...args) => mockUserFindOne(...args),
    findAll: (...args) => mockUserFindAll(...args),
    findByPk: (...args) => mockUserFindByPk(...args),
    create: (...args) => mockUserCreate(...args),
    destroy: (...args) => mockUserDestroy(...args),
    update: (...args) => mockUserUpdate(...args),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('../../../src/services/CourseService', () => ({
  deleteCoursesByAuthor: jest.fn().mockResolvedValue(undefined),
}));

const bcrypt = require('bcrypt');
const {
  getUserInfo,
  getAllUsers,
  createCollab,
  deleteUser,
  deleteAllUsers,
  updateUserInfo,
  updateUserPassword,
  updateCollabPrivilege,
} = require('../../../src/controllers/users/user.controller');

describe('user.controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, user: { id: 1, userID: 'LEA123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('getUserInfo', () => {
    it('should return 200 with user on success', async () => {
      req.params = { userID: 'LEA123' };
      const user = { userID: 'LEA123', name: 'Test', email: 't@t.com' };
      mockUserFindOne.mockResolvedValue(user);

      await getUserInfo(req, res);

      expect(res.json).toHaveBeenCalledWith(user);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 when user not found', async () => {
      req.params = { userID: 'LEA999' };
      mockUserFindOne.mockResolvedValue(null);

      await getUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });
  });

  describe('getAllUsers', () => {
    it('should return 200 with users array', async () => {
      const users = [{ userID: 'LEA1', name: 'User1' }];
      mockUserFindAll.mockResolvedValue(users);

      await getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(users);
    });
  });

  describe('createCollab', () => {
    it('should return 201 on success', async () => {
      req.body = {
        name: 'Collab',
        email: 'c@c.com',
        role: 'COLLAB',
        password: 'pass',
      };
      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ userID: 'COL123' });

      await createCollab(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Created user successfully' })
      );
    });

    it('should return 401 when email already registered', async () => {
      req.body = { name: 'C', email: 'exists@test.com', password: 'pass' };
      mockUserFindOne.mockResolvedValue({ email: 'exists@test.com' });

      await createCollab(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ERROR: 'Email is registered' });
    });
  });

  describe('deleteUser', () => {
    it('should return 200 on success', async () => {
      req.params = { userID: 'LEA123' };
      mockUserDestroy.mockResolvedValue(1);

      await deleteUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Deleted user successfully',
      });
    });

    it('should return 404 when user not found', async () => {
      req.params = { userID: 'LEA999' };
      mockUserDestroy.mockResolvedValue(0);

      await deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('deleteAllUsers', () => {
    it('should return 200 on success', async () => {
      mockUserDestroy.mockResolvedValue(5);

      await deleteAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All users deleted successfully',
      });
    });

    it('should return 404 when no users to delete', async () => {
      mockUserDestroy.mockResolvedValue(0);

      await deleteAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'No users found to delete',
      });
    });
  });

  describe('updateUserInfo', () => {
    it('should return 200 on success', async () => {
      req.body = { name: 'New Name', email: 'new@test.com' };
      mockUserFindByPk.mockResolvedValue({ id: 1 });
      mockUserUpdate.mockResolvedValue([1]);

      await updateUserInfo(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Update user information successfully',
      });
    });

    it('should return 404 when user not found', async () => {
      mockUserFindByPk.mockResolvedValue(null);

      await updateUserInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated fail, no user not found',
      });
    });
  });

  describe('updateUserPassword', () => {
    it('should return 200 on success', async () => {
      req.body = { password: 'old', newPassword: 'new' };
      mockUserFindByPk.mockResolvedValue({
        id: 1,
        password: 'hashed_old',
      });
      bcrypt.compare.mockResolvedValue(true);
      mockUserUpdate.mockResolvedValue([1]);

      await updateUserPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Update user password successfully',
      });
    });

    it('should return 404 when user not found', async () => {
      mockUserFindByPk.mockResolvedValue(null);

      await updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 401 when current password is invalid', async () => {
      mockUserFindByPk.mockResolvedValue({
        id: 1,
        password: 'hashed',
      });
      bcrypt.compare.mockResolvedValue(false);

      await updateUserPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid current password',
      });
    });
  });

  describe('updateCollabPrivilege', () => {
    it('should return 200 on success', async () => {
      req.body = { role: 'ADMIN' };
      mockUserUpdate.mockResolvedValue([1]);

      await updateCollabPrivilege(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'Update user information successfully',
      });
    });

    it('should return 404 when no rows updated', async () => {
      req.body = { role: 'ADMIN' };
      mockUserUpdate.mockResolvedValue([0]);

      await updateCollabPrivilege(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Updated fail, no user not found',
      });
    });
  });
});
