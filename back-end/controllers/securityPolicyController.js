// 安全策略 Controller：读取 / 修改策略
// 只负责 HTTP 层；业务逻辑（getOrCreatePolicy）已在 securityPolicyService

const SecurityPolicy = require('../models/SecurityPolicy');
const { getOrCreatePolicy } = require('../services/securityPolicyService');

// GET /api/security-policy  读取当前策略（登录即可查看，便于前端展示）
async function getPolicy(req, res) {
  try {
    const policy = await getOrCreatePolicy();
    res.status(200).json({
      code: 200,
      data: {
        maxLoginAttempts: policy.maxLoginAttempts,
        lockDuration: policy.lockDuration,
        passwordMinLength: policy.passwordMinLength,
        tokenExpiry: policy.tokenExpiry,
        updatedAt: policy.updatedAt
      }
    });
  } catch (err) {
    console.error('读取安全策略失败:', err);
    res.status(500).json({ code: 500, message: '读取安全策略失败' });
  }
}

// PUT /api/security-policy  修改策略（仅管理员）
async function updatePolicy(req, res) {
  try {
    const { maxLoginAttempts, lockDuration, passwordMinLength, tokenExpiry } = req.body;

    const policy = await getOrCreatePolicy();

    // 只接受合法字段，非法类型直接拒绝
    const updateFields = {};
    if (typeof maxLoginAttempts === 'number' && maxLoginAttempts >= 1) updateFields.maxLoginAttempts = maxLoginAttempts;
    if (typeof lockDuration === 'number' && lockDuration >= 1) updateFields.lockDuration = lockDuration;
    if (typeof passwordMinLength === 'number' && passwordMinLength >= 1) updateFields.passwordMinLength = passwordMinLength;
    if (typeof tokenExpiry === 'number' && tokenExpiry >= 1) updateFields.tokenExpiry = tokenExpiry;

    updateFields.updatedAt = new Date();

    const updated = await SecurityPolicy.findByIdAndUpdate(policy._id, updateFields, { new: true, upsert: true });

    res.status(200).json({
      code: 200,
      message: '策略已更新',
      data: {
        maxLoginAttempts: updated.maxLoginAttempts,
        lockDuration: updated.lockDuration,
        passwordMinLength: updated.passwordMinLength,
        tokenExpiry: updated.tokenExpiry,
        updatedAt: updated.updatedAt
      }
    });
  } catch (err) {
    console.error('更新安全策略失败:', err);
    res.status(500).json({ code: 500, message: '更新安全策略失败' });
  }
}

module.exports = { getPolicy, updatePolicy };
