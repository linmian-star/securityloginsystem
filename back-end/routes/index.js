// 路由统一出口
// 把分散的路由文件聚合成一个对象，server.js 只需 app.use(...) 即可
//
// 注意：auth 路由的 /register 和 /login 没有 /api 前缀（历史 API），
// 因此 authRoutes 在 server.js 中顶层挂载（不带 /api）；
// 其他模块的最终 URL 都以 /api 开头，由 server.js 用 app.use('/api', ...) 挂载。

const authRoutes = require('./auth');
const userRoutes = require('./users');
const dashboardRoutes = require('./dashboard');
const auditLogRoutes = require('./auditLogs');
const roleRoutes = require('./roles');
const securityPolicyRoutes = require('./securityPolicy');
const systemRoutes = require('./system');

module.exports = {
  authRoutes,
  userRoutes,
  dashboardRoutes,
  auditLogRoutes,
  roleRoutes,
  securityPolicyRoutes,
  systemRoutes
};
