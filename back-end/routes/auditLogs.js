// 审计日志路由
// 最终 URL：
//   GET /api/audit-logs
//   GET /api/audit-logs/stats

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getAuditLogs, getAuditLogStats } = require('../controllers/auditLogController');

// 注意顺序：/stats 是更具体的路径，必须放在 / 之前
// 否则 /stats 会被 / 的可选匹配或后续匹配吞掉（此处 / 是 GET 列表，不会冲突，但仍按具体优先原则排列）
router.get('/stats', verifyToken, requireRole('admin'), getAuditLogStats);
router.get('/', verifyToken, requireRole('admin'), getAuditLogs);

module.exports = router;
