const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 存哈希值，不存明文
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },

  // ===== 账号锁定相关字段 =====
  loginAttempts:   { type: Number, default: 0 },      // 当前累计失败次数
  lockedUntil:     { type: Date, default: null },     // 账号被锁定到的时间点（过期后可自动解锁）
  lastAttemptAt:   { type: Date, default: null }      // 最近一次尝试时间（便于策略变化时重置计数）
});

module.exports = mongoose.model('User', UserSchema);
