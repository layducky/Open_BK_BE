/**
 * Script kiểm tra Redis cache cho pagination course.
 * Chạy: node scripts/checkRedisCache.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { getRedis } = require("../src/configs/redis");

async function main() {
  const client = getRedis();
  if (!client) {
    console.log("❌ Redis không kết nối (REDIS_HOST chưa set?)");
    process.exit(1);
  }

  const keys = await client.keys("course:*");
  const listKeys = keys.filter((k) => k.startsWith("course:list:"));
  const countKeys = keys.filter((k) => k.startsWith("course:count:"));

  console.log("\n📊 Redis Cache cho Course Pagination\n");
  console.log(`Tổng keys course:*: ${keys.length}`);
  console.log(`  - course:list:* (pagination): ${listKeys.length}`);
  console.log(`  - course:count:* (total):     ${countKeys.length}`);

  if (listKeys.length > 0) {
    console.log("\n📄 Mẫu course:list keys:");
    for (const k of listKeys.slice(0, 8)) {
      const ttl = await client.ttl(k);
      console.log(`  ${k}`);
      console.log(`    TTL: ${ttl}s`);
    }
  }

  if (countKeys.length > 0) {
    console.log("\n🔢 course:count keys (cache total - tránh gọi count DB nhiều lần):");
    for (const k of countKeys.slice(0, 5)) {
      const val = await client.get(k);
      const ttl = await client.ttl(k);
      console.log(`  ${k} = ${val} (TTL: ${ttl}s)`);
    }
  }

  const sampleKey = listKeys[0];
  if (sampleKey) {
    const raw = await client.get(sampleKey);
    if (raw) {
      const data = JSON.parse(raw);
      const hasPaginated = data?.courses !== undefined && data?.total !== undefined;
      console.log(`\n📦 Sample payload (${sampleKey}):`);
      console.log(`  Paginated format: ${hasPaginated ? "✓" : "✗"}`);
      if (hasPaginated) {
        console.log(`  - courses: ${data.courses?.length ?? 0} items`);
        console.log(`  - total: ${data.total}`);
      } else {
        console.log(`  - Array length: ${Array.isArray(data) ? data.length : "N/A"}`);
      }
    }
  }

  console.log("\n✅ Cache hoạt động. TTL = 300s (5 phút).");
  console.log("");
  if (client.quit) await client.quit().catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
