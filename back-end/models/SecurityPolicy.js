const mongoose = require('mongoose');

// 安全策略表：整个系统的安全配置，永远只有一条文档
const SecurityPolicySchema = new mongoose.Schema({
  maxLoginAttempts:  { type: Number, default: 5 },     // 最大登录失败次数，超过锁定
  lockDuration:      { type: Number, default: 30 },    // 锁定时长（分钟）
  passwordMinLength: { type: Number, default: 6 },    // 注册密码最小长度
  tokenExpiry:       { type: Number, default: 60 },    // Token 有效期（分钟），暂只展示不强制生效
  updatedAt:         { type: Date, default: Date.now } // 最后修改时间
});

module.exports = mongoose.model('SecurityPolicy', SecurityPolicySchema);
