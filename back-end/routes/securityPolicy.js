// 安全策略路由
// 最终 URL：
//   GET /api/security-policy
//   PUT /api/security-policy

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getPolicy, updatePolicy } = require('../controllers/securityPolicyController');

router.get('/', verifyToken, getPolicy);
router.put('/', verifyToken, requireRole('admin'), updatePolicy);

module.exports = router;
