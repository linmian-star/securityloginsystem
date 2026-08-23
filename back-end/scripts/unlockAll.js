// 紧急解锁脚本：清除所有账号锁定 + 所有 IP 锁定
// 场景：测试锁定策略时把自己锁死了，或者服务重启前遗留了锁定状态
// 用法（Docker 内）：
//   docker exec securityloginsystem-api-1 node scripts/unlockAll.js
// 用法（本地开发）：
//   node back-end/scripts/unlockAll.js
require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');
const crypto = require('crypto');
if (typeof globalThis.crypto === 'undefined') { globalThis.crypto = crypto; }

const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    console.log('🔗 MongoDB 已连接');

    // ===== 1. 清空所有账号的锁定状态 =====
    const userResult = await User.updateMany(
      {},
      {
        $set: {
          loginAttempts: 0,
          lockedUntil: null,
          lastAttemptAt: null
        }
      }
    );
    console.log(`✅ 已解锁 ${userResult.nModified || userResult.modifiedCount || 0} 个账号`);

    // ===== 2. 清空 Redis 中所有 IP 锁 =====
    let redisCleared = 0;
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redis = new Redis(redisUrl, {
        enableReadyCheck: true,
        connectTimeout: 3000, // Redis 不可用时 3 秒超时，不一直挂住
      });

      // 用 SCAN 迭代删除所有 ip:lock:* 的 key（避免 KEYS 阻塞 Redis）
      let cursor = 0;
      do {
        const [nextCursor, keys] = await redis.scan(
          cursor,
          'MATCH', 'ip:lock:*',
          'COUNT', 100
        );
        cursor = parseInt(nextCursor, 10);
        if (keys.length > 0) {
          await redis.del(...keys);
          redisCleared += keys.length;
          console.log(`  - 批量删除 IP 锁 Key: ${keys.join(', ')}`);
        }
      } while (cursor !== 0);

      await redis.quit();
      console.log(`✅ 已清除 ${redisCleared} 条 IP 锁`);
    } catch (redisErr) {
      console.log(`⚠️  Redis 不可用或连接失败，跳过 IP 锁清理: ${redisErr.message}`);
    }

    console.log('\n🎉 全部解锁完成！现在可以用原密码正常登录了。');
    process.exit(0);
  } catch (err) {
    console.error('❌ 解锁脚本执行失败:', err.message);
    process.exit(1);
  }
})();
