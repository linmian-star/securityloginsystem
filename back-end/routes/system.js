// 系统设置路由
// 最终 URL：GET /api/system/info

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getSystemInfo } = require('../controllers/systemController');

router.get('/info', verifyToken, getSystemInfo);

module.exports = router;
