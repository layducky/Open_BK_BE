jest.setTimeout(10000);
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-secret';
process.env.ACCESS_TOKEN_LIFETIME = '1h';
process.env.DB_URL = process.env.DB_URL || 'postgres://test:test@localhost:5432/test_db';
