const Redis = require('ioredis');
const { REDIS_URL } = require('./index'); // 从集中配置读取连接地址

// 创建 Redis 客户端
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null, // 允许无限重试，保证网络抖动时不丢请求
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('✅ 已连接到 Redis (用于 IP 锁定等高速缓存)');
});

redis.on('error', (err) => {
  console.error('❌ Redis 连接错误:', err.message);
});

redis.on('ready', () => {
  console.log('🚀 Redis 已就绪');
});

module.exports = redis;
