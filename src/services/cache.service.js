const { getRedis } = require('../configs/redis');

const CACHE_TTL = {
  COURSE_LIST: 300,      // 5 phút
  COURSE_DETAIL: 300,    // 5 phút
  CATEGORIES: 3600,      // 1 giờ (static)
  UNITS: 300,            // 5 phút
};

async function getCache(key) {
  const client = getRedis();
  if (!client) return null;
  try {
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function setCache(key, value, ttlSeconds = CACHE_TTL.COURSE_LIST) {
  const client = getRedis();
  if (!client) return;
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Bỏ qua lỗi ghi cache
  }
}

async function delCache(key) {
  const client = getRedis();
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // Bỏ qua
  }
}

/** Xóa tất cả key theo pattern (dùng SCAN, tránh keys *) */
async function delCachePattern(pattern) {
  const client = getRedis();
  if (!client) return;
  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length > 0) await client.del(...keys);
    } while (cursor !== '0');
  } catch {
    // Bỏ qua
  }
}

module.exports = {
  getCache,
  setCache,
  delCache,
  delCachePattern,
  CACHE_TTL,
};
