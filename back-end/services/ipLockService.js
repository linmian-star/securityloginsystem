// IP 锁服务：基于 Redis 的 IP 维度登录失败计数与锁定
// 从 server.js 原样迁移，不修改任何业务规则

const redis = require('../config/redis');

// Redis Key 前缀，和原代码保持一致
const IP_LOCK_KEY_PREFIX = 'ip:lock:';

// 判断某 IP 当前是否被锁
// 必须传 maxAttempts（来自策略）：只有次数 >= maxAttempts 才算锁住，
// 1 ~ maxAttempts-1 次时只是"累计中"，不会拦截（和账号锁逻辑对齐）
const isIpLocked = async (ip, maxAttempts) => {
  try {
    const countStr = await redis.get(IP_LOCK_KEY_PREFIX + ip);
    if (countStr === null) return false;      // Key 不存在 → 一次都没失败过 → 未锁
    const count = parseInt(countStr, 10);     // Redis GET 返回字符串，必须转数字
    if (isNaN(count)) return false;           // 极端兜底：解析失败就当没锁（降级放行）
    return count >= maxAttempts;              // 次数达到阈值才算锁住
  } catch (err) {
    // Redis 故障：降级放行，打印警告
    console.warn('⚠️ Redis 不可用，IP 锁定检查降级为放行:', err.message);
    return false;
  }
};

// 某 IP 登录失败一次：INCR 原子递增 + 首次设 TTL + 达阈值刷新 TTL
const recordIpFailure = async (ip, maxAttempts, lockMinutes) => {
  const key = IP_LOCK_KEY_PREFIX + ip;
  const lockSeconds = lockMinutes * 60;
  try {
    const newCount = await redis.incr(key);
    if (newCount === 1) {
      // 第一次失败，设置过期时间（避免永远不清理）
      await redis.expire(key, lockSeconds);
    }
    if (newCount >= maxAttempts) {
      // 达到阈值，延长过期时间到锁定时长，保证锁定持续到 lockMinutes
      await redis.expire(key, lockSeconds);
    }
  } catch (err) {
    console.warn('⚠️ Redis 不可用，IP 失败记录降级为放行:', err.message);
  }
};

// 某 IP 登录成功 → 清空失败计数
const clearIpFailure = async (ip) => {
  try {
    await redis.del(IP_LOCK_KEY_PREFIX + ip);
  } catch (err) {
    console.warn('⚠️ Redis 不可用，IP 锁清理失败:', err.message);
  }
};

module.exports = { isIpLocked, recordIpFailure, clearIpFailure };
