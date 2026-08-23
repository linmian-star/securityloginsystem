// 系统设置 Controller：系统运行信息
// 只负责 HTTP 层

const mongoose = require('mongoose');
const User = require('../models/User');
const redis = require('../config/redis');

// GET /api/system/info  返回系统运行信息（任意登录用户可查看）
async function getSystemInfo(req, res) {
  try {
    const userCount = await User.countDocuments({});

    // MongoDB 连接状态：mongoose 自带
    // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Redis 连接状态：ioredis 自带
    // status: 'wait' | 'connect' | 'ready' | 'close' | 'reconnecting' | 'end' | 'error'
    const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';

    // 运行时长：process.uptime() 返回秒数
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${hours}小时${minutes}分钟`;

    res.status(200).json({
      code: 200,
      data: {
        nodeVersion: process.version,
        uptime,
        userCount,
        mongoStatus,
        redisStatus,
        currentUsername: req.user.username,
        currentRole: req.user.role,
        jwtExpiry: '1h'
      }
    });
  } catch (err) {
    console.error('查询系统信息失败:', err);
    res.status(500).json({ code: 500, message: '查询系统信息失败' });
  }
}

module.exports = { getSystemInfo };
