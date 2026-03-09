const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

const mockUserCreate = jest.fn();
const mockUserFindOne = jest.fn();

jest.mock('../../../src/sequelize', () => ({
  sequelize: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  },
  User: {
    findOne: jest.fn((...args) => mockUserFindOne(...args)),
    create: jest.fn((...args) => mockUserCreate(...args)),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_access_token'),
}));

const bcrypt = require('bcrypt');
const { signUp, logIn, logOut } = require('../../../src/controllers/auth/auth.controller');

describe('auth.controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };
  });

  describe('signUp', () => {
    it('should return 200 with accessToken, userID, role on success', async () => {
      req.body = { name: 'Test User', email: 'test@test.com', password: 'password123' };
      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        userID: 'LEA123456',
        name: 'Test User',
        role: 'LEARNER',
      });

      await signUp(req, res);

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.userID).toMatch(/^LEA\d{6}$/);
      expect(jsonCall.name).toBe('Test User');
      expect(jsonCall.role).toBe('LEARNER');
      expect(jsonCall.accessToken).toBe('fake_access_token');
      expect(jsonCall.message).toBe('Register successfully!');
    });

    it('should return 401 when email is already registered', async () => {
      req.body = { name: 'Test', email: 'exists@test.com', password: 'pass' };
      mockUserFindOne.mockResolvedValue({ email: 'exists@test.com' });

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ERROR: 'Email is registered' });
      expect(mockUserCreate).not.toHaveBeenCalled();
    });

    it('should return 500 on DB error', async () => {
      req.body = { name: 'Test', email: 'new@test.com', password: 'pass' };
      mockUserFindOne.mockResolvedValue(null);
      mockUserCreate.mockRejectedValue(new Error('DB error'));

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ err: 'Error during registration' })
      );
    });
  });

  describe('logIn', () => {
    it('should return 200 with accessToken on success', async () => {
      req.body = { email: 'test@test.com', password: 'password123' };
      const mockUser = {
        userID: 'LEA123456',
        name: 'Test User',
        email: 'test@test.com',
        password: 'hashed',
        role: 'LEARNER',
        image: 'url',
        provider: 'credentials',
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await logIn(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userID: 'LEA123456',
          name: 'Test User',
          role: 'LEARNER',
          accessToken: 'fake_access_token',
          message: 'Login successfully!',
        })
      );
    });

    it('should return 401 when email is not registered', async () => {
      req.body = { email: 'unknown@test.com', password: 'pass' };
      mockUserFindOne.mockResolvedValue(null);

      await logIn(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ ERROR: 'Email is not registered' });
    });

    it('should return 403 when provider is not credentials', async () => {
      req.body = { email: 'oauth@test.com', password: 'pass' };
      mockUserFindOne.mockResolvedValue({
        provider: 'google',
        email: 'oauth@test.com',
      });

      await logIn(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        ERROR: 'Please log in using your registered provider.',
      });
    });

    it('should return 404 when password is incorrect', async () => {
      req.body = { email: 'test@test.com', password: 'wrong' };
      mockUserFindOne.mockResolvedValue({
        provider: 'credentials',
        password: 'hashed',
      });
      bcrypt.compare.mockResolvedValue(false);

      await logIn(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password is incorrect' });
    });
  });

  describe('logOut', () => {
    it('should clear cookie and return 200', async () => {
      await logOut(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully!' });
    });
  });
});
