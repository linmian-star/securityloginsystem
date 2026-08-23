// 用户管理路由
// 最终 URL：
//   GET    /api/users
//   DELETE /api/users/:id

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { getUsers, deleteUser } = require('../controllers/userController');

router.get('/', verifyToken, getUsers);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

module.exports = router;
