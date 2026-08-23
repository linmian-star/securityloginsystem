// 认证相关 Controller：register / login / changePassword
// 只负责 HTTP 层：从 req 取数据 → 调 service → 写 res
// login 已有 loginService，直接调用，不重新实现业务逻辑
// register / changePassword 暂无独立 service，业务代码原样从 server.js 搬过来

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getOrCreatePolicy } = require('../services/securityPolicyService');
const { recordAuditLog } = require('../services/auditLogService');
const { login: loginService } = require('../services/loginService');

// POST /register
async function register(req, res) {
  const { username, password } = req.body;
  try {
    // 读取密码最小长度策略
    const policy = await getOrCreatePolicy();
    if (!password || password.length < policy.passwordMinLength) {
      return res.status(400).json({
        code: 400,
        message: `密码长度至少需要 ${policy.passwordMinLength} 位`
      });
    }

    // 检查是否已存在
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ code: 400, message: '用户名已存在' });

    // 密码加盐哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    // 埋点：记录注册行为。日志失败不影响主流程
    await recordAuditLog({
      username, action: 'register', status: 'success',
      ip: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ code: 200, message: '注册成功' });
  } catch (err) {
    console.error("authentic error stack:", err);
    res.status(500).json({ code: 500, message: '注册失败', error: err.message, stack: err.stack });
  }
}

// POST /login
async function login(req, res) {
  // HTTP 层：只负责从 req 取数据 + 调 loginService + 按结果写响应
  // 业务逻辑（双锁/密码验证/JWT/审计日志）全部在 services/loginService.js
  const { username, password } = req.body;
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  try {
    const { httpStatus, response } = await loginService({ username, password, ip, userAgent });
    return res.status(httpStatus).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
}

// PUT /api/auth/password  修改自己的密码
async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;
    const operator = req.user.username;

    // 1. 参数校验
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ code: 400, message: '请填写旧密码和新密码' });
    }

    // 2. 读取密码最小长度策略（与注册接口保持一致）
    const policy = await getOrCreatePolicy();
    if (newPassword.length < policy.passwordMinLength) {
      return res.status(400).json({
        code: 400,
        message: `新密码长度至少需要 ${policy.passwordMinLength} 位`
      });
    }

    // 3. 不能和旧密码相同
    if (oldPassword === newPassword) {
      return res.status(400).json({ code: 400, message: '新密码不能与旧密码相同' });
    }

    // 4. 查用户并验证旧密码
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      // 旧密码错误也写一条日志，便于审计
      await recordAuditLog({
        username: operator,
        action: 'password_change',
        status: 'fail',
        detail: '旧密码错误',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      return res.status(400).json({ code: 400, message: '旧密码不正确' });
    }

    // 5. 加密新密码并保存
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();

    // 6. 写审计日志
    await recordAuditLog({
      username: operator,
      action: 'password_change',
      status: 'success',
      detail: '用户修改了自己的密码',
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({ code: 200, message: '密码修改成功，下次登录请使用新密码' });
  } catch (err) {
    console.error('修改密码失败:', err);
    res.status(500).json({ code: 500, message: '修改密码失败' });
  }
}

module.exports = { register, login, changePassword };
