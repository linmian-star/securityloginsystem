// 认证中间件：verifyToken（校验 JWT）+ requireRole（校验角色）
// 从 server.js 原样迁移，不修改任何业务逻辑

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Token 校验中间件
// 工作流程：读请求头 Authorization → jwt.verify 解 JWT → 把解出的 user 挂到 req.user → next()
// 用法：app.get('/xxx', verifyToken, ...)
const verifyToken = (req, res, next) => {
  // 1. 从请求头拿到 Authorization
  const authHeader = req.headers['authorization'];
  // 这里的格式通常是 "Bearer <token>"，所以要用 split 分割
  const token =  authHeader?.split(' ')[1];

  // 2. 如果根本没带 Token
  if (!token) {
    return res.status(403).json({ message: '拒绝访问：没有令牌！' });
  }

  // 3. 校验 Token 是否合法/过期
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: '令牌无效或已过期' });
    }
    // 4. 校验通过，把用户信息存入 req，方便后面使用
    req.user = user;
    // 5. 放行！去执行下一个函数
    next();
  });
};

// 权限校验中间件：在 verifyToken 之后用，校验用户角色是否满足要求
// 用法：app.get('/xxx', verifyToken, requireRole('admin'), ...)
// role 从 JWT 里解出来（verifyToken 把它挂到 req.user 上），不用每次再查库
const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(403).json({ message: '无权访问' });
  if (req.user.role !== role) {
    return res.status(403).json({ code: 403, message: '权限不足，需要管理员权限' });
  }
  next();
};

module.exports = { verifyToken, requireRole };
