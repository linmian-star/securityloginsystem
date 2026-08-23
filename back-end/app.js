// Express 应用配置：创建 app、注册全局 middleware、挂载 routes
// 不启动 HTTP Server（由 server.js 负责监听端口）
//
// 这样拆分后：
//   server.js = 进程入口（只负责连接 DB + listen）
//   app.js    = 应用配置（routes / middleware / app 实例）
// 测试或不监听端口的场景可以直接 require('./app') 拿到 app 实例。

require('dotenv').config(); // 加载 .env（防御性加载，config/index.js 内部也会加载）
const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // Node 18 兼容 polyfill（某些库依赖 globalThis.crypto）

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto;
}

const app = express();

// 全局 middleware
app.use(cors()); // 解决跨域
app.use(express.json());

// 路由层（只负责 method + path + middleware + handler）
const {
  authRoutes,
  userRoutes,
  dashboardRoutes,
  auditLogRoutes,
  roleRoutes,
  securityPolicyRoutes,
  systemRoutes
} = require('./routes');

// auth 路由在顶层挂载（/register、/login 没有 /api 前缀，前端已依赖）
app.use('/', authRoutes);

// 其他路由统一挂 /api 前缀
app.use('/api/users', userRoutes);
app.use('/api', dashboardRoutes);                     // /api/dashboard-stats
app.use('/api/audit-logs', auditLogRoutes);           // /api/audit-logs、/api/audit-logs/stats
app.use('/api/roles', roleRoutes);                    // /api/roles、/api/roles/change
app.use('/api/security-policy', securityPolicyRoutes);// /api/security-policy
app.use('/api/system', systemRoutes);                 // /api/system/info

module.exports = app;
