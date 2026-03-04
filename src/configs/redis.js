const Redis = require('ioredis');

let redis = null;

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

function getRedis() {
  if (!REDIS_HOST) return null;
  if (redis) return redis;
  try {
    redis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    redis.on('error', () => {}); // Tránh uncaught exception làm crash app
    redis.on('connect', () => console.log('Redis connected'));
  } catch (err) {
    console.warn('Redis init failed:', err.message);
    return null;
  }
  return redis;
}

module.exports = { getRedis };
