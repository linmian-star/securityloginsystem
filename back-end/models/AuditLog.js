const mongoose = require('mongoose');

// 日志审计表：记录"谁、在什么时候、做了什么、结果如何、从哪来的"
const AuditLogSchema = new mongoose.Schema({
  username: { type: String, default: '未知' },      // 谁操作（用户名不存在时用"未知"）
  action: {                                          // 做了什么：枚举值
    type: String,
    enum: ['login_success', 'login_failed', 'register', 'delete_user', 'role_change', 'password_change'],
    required: true
  },
  ip: { type: String, default: '' },                 // 从哪个 IP 来的
  userAgent: { type: String, default: '' },          // 浏览器标识
  status: { type: String, enum: ['success', 'fail'], default: 'success' },
  detail: { type: String, default: '' },             // 补充信息，比如"密码错误"/"用户名不存在"
  createdAt: { type: Date, default: Date.now }
});

// TTL 索引：90 天前的日志自动删除，防止日志无限增长拖垮数据库
// 0 表示文档过期后立即删除（MongoDB 后台每 60 秒扫一次）
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
