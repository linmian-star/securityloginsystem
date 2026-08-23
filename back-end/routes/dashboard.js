// 仪表盘路由
// 最终 URL：GET /api/dashboard-stats

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

router.get('/dashboard-stats', verifyToken, getDashboardStats);

module.exports = router;
