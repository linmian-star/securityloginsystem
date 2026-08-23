// 登录业务服务：把 /login 里纯业务部分从 HTTP 路由层抽离出来
// 原则：只搬代码，不改行为；禁止出现 req / res / next
// 保持双锁执行顺序：IP 锁检查 → 账号查询/账号锁 → 密码验证 → 成功/失败副作用

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');
const { isIpLocked, recordIpFailure, clearIpFailure } = require('./ipLockService');
const { getOrCreatePolicy } = require('./securityPolicyService');
const { recordAuditLog } = require('./auditLogService');

/**
 * 处理登录业务（纯业务，不含 HTTP 层）
 * @param {Object} params
 * @param {string} params.username    用户输入的用户名
 * @param {string} params.password    用户输入的明文密码
 * @param {string} params.ip          请求者 IP
 * @param {string} [params.userAgent] User-Agent（写入审计日志）
 * @returns {Promise<Object>} { httpStatus, response }
 *   httpStatus: 原代码里的 res.status 数字
 *   response:   原代码里的 res.json 传参（含 code / message / token / role / username）
 * @throws {Error} 任何未预期的异常（catch 后原 server.js 会转 500）
 */
const login = async ({ username, password, ip, userAgent = '' }) => {
  // 0. 读取当前安全策略（决定锁定阈值与时长）
  const policy = await getOrCreatePolicy();
  const now = new Date();

  // 0.1 IP 维度锁定检查（用户不存在时也能拦截爆破）
  // 只有次数 >= maxLoginAttempts 才算锁住，1~maxLoginAttempts-1 次只是累计
  if (await isIpLocked(ip, policy.maxLoginAttempts)) {
    await recordAuditLog({
      username: username || '未知', action: 'login_failed', status: 'fail',
      detail: `IP 已被临时锁定（${policy.lockDuration} 分钟）`,
      ip, userAgent
    });
    return {
      httpStatus: 429,
      response: {
        code: 429,
        message: `当前 IP 尝试次数过多，请 ${policy.lockDuration} 分钟后再试`
      }
    };
  }

  // 1. 去 MongoDB 查找用户
  const user = await User.findOne({ username });

  // 1.1 账号维度锁定检查（账号存在且仍在锁定期）
  if (user && user.lockedUntil && user.lockedUntil > now) {
    const remainMinutes = Math.ceil((user.lockedUntil - now) / 60000);
    await recordAuditLog({
      username, action: 'login_failed', status: 'fail',
      detail: `账号已锁定，剩余约 ${remainMinutes} 分钟`,
      ip, userAgent
    });
    return {
      httpStatus: 429,
      response: {
        code: 429,
        message: `账号已锁定，请 ${remainMinutes} 分钟后再试`
      }
    };
  }

  if (!user) {
    // 用户名不存在：仍然计入 IP 失败，防止扫描
    await recordIpFailure(ip, policy.maxLoginAttempts, policy.lockDuration);
    await recordAuditLog({
      username: username || '未知', action: 'login_failed', status: 'fail',
      detail: '用户名不存在',
      ip, userAgent
    });
    return {
      httpStatus: 401,
      response: { code: 401, message: '用户名或密码错误' }
    };
  }

  // 2. 比较加密后的密码（数据库存的是哈希，入参是明文）
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // 密码错误：账号失败 + IP 失败同时累加
    const newAttempts = (user.loginAttempts || 0) + 1;
    const updatePayload = {
      loginAttempts: newAttempts,
      lastAttemptAt: now
    };
    if (newAttempts >= policy.maxLoginAttempts) {
      updatePayload.lockedUntil = new Date(now.getTime() + policy.lockDuration * 60 * 1000);
    }
    await User.findByIdAndUpdate(user._id, updatePayload);

    await recordIpFailure(ip, policy.maxLoginAttempts, policy.lockDuration);

    await recordAuditLog({
      username, action: 'login_failed', status: 'fail',
      detail: `密码错误（第 ${newAttempts} 次）`,
      ip, userAgent
    });

    // 达到阈值就直接用锁定文案回复
    if (newAttempts >= policy.maxLoginAttempts) {
      return {
        httpStatus: 429,
        response: {
          code: 429,
          message: `密码错误次数过多，账号已锁定 ${policy.lockDuration} 分钟`
        }
      };
    }
    return {
      httpStatus: 401,
      response: {
        code: 401,
        message: `用户名或密码错误（剩余尝试次数：${policy.maxLoginAttempts - newAttempts}）`
      }
    };
  }

  // 3. 验证成功，生成 Token（payload、secret、expiresIn 一字未动）
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 登录成功 → 重置账号/IP 锁定计数
  await User.findByIdAndUpdate(user._id, {
    $set: { loginAttempts: 0, lockedUntil: null, lastAttemptAt: now }
  });
  await clearIpFailure(ip);

  await recordAuditLog({
    username, action: 'login_success', status: 'success',
    ip, userAgent
  });

  return {
    httpStatus: 200,
    response: { code: 200, message: '登录成功', token, role: user.role, username: user.username }
  };
};

module.exports = { login };
