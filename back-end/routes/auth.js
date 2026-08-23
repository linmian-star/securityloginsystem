// 认证路由
// 注意：/register 和 /login 没有 /api 前缀（历史 API）
// /api/auth/password 才有 /api 前缀
// 因此本路由文件在 server.js 顶层挂载（不挂 /api），内部完整保留原路径

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { register, login, changePassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.put('/api/auth/password', verifyToken, changePassword);

module.exports = router;
