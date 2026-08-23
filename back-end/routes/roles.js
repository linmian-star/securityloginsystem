// 角色权限路由
// 最终 URL：
//   GET /api/roles
//   PUT /api/roles/change

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getRoles, changeRole } = require('../controllers/roleController');

router.get('/', verifyToken, requireRole('admin'), getRoles);
router.put('/change', verifyToken, requireRole('admin'), changeRole);

module.exports = router;
