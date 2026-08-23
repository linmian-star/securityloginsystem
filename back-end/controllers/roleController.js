// 角色权限 Controller：角色列表 / 角色修改
// 只负责 HTTP 层

const User = require('../models/User');
const { recordAuditLog } = require('../services/auditLogService');

// GET /api/roles  返回每个角色的用户数 + 用户列表（仅管理员）
async function getRoles(req, res) {
  try {
    // 查所有用户，只取必要字段（不返回密码哈希）
    const allUsers = await User.find({}).select('username role createdAt');

    // 按角色分组
    const adminUsers = allUsers.filter(u => u.role === 'admin').map(u => ({
      username: u.username,
      role: u.role,
      createdAt: u.createdAt
    }));
    const normalUsers = allUsers.filter(u => u.role !== 'admin').map(u => ({
      username: u.username,
      role: u.role || 'user',
      createdAt: u.createdAt
    }));

    res.status(200).json({
      code: 200,
      data: {
        admin: { count: adminUsers.length, users: adminUsers },
        user:  { count: normalUsers.length, users: normalUsers }
      }
    });
  } catch (err) {
    console.error('查询角色列表失败:', err);
    res.status(500).json({ code: 500, message: '查询角色列表失败' });
  }
}

// PUT /api/roles/change  修改某用户的角色（仅管理员）
async function changeRole(req, res) {
  try {
    const { username, newRole } = req.body;
    const operator = req.user.username; // 谁在操作（从 JWT 拿）

    // 1. 参数校验
    if (!username || !newRole) {
      return res.status(400).json({ code: 400, message: '缺少 username 或 newRole' });
    }
    if (!['admin', 'user'].includes(newRole)) {
      return res.status(400).json({ code: 400, message: 'newRole 只能是 admin 或 user' });
    }

    // 2. 不能改自己的角色（防止管理员把自己降级后系统无管理员）
    if (username === operator) {
      return res.status(400).json({ code: 400, message: '不能修改自己的角色' });
    }

    // 3. 查目标用户
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ code: 404, message: '目标用户不存在' });
    }

    const oldRole = targetUser.role || 'user';

    // 4. 如果要把 admin 降级为 user，先检查系统里还剩几个 admin
    if (oldRole === 'admin' && newRole === 'user') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ code: 400, message: '系统至少需要保留 1 个管理员' });
      }
    }

    // 5. 执行修改
    targetUser.role = newRole;
    await targetUser.save();

    // 6. 写审计日志
    await recordAuditLog({
      username: operator,
      action: 'role_change',
      status: 'success',
      detail: `将用户 ${username} 的角色从 ${oldRole} 改为 ${newRole}`,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      code: 200,
      message: `已将 ${username} 的角色改为 ${newRole}`,
      data: { username, oldRole, newRole }
    });
  } catch (err) {
    console.error('修改角色失败:', err);
    res.status(500).json({ code: 500, message: '修改角色失败' });
  }
}

module.exports = { getRoles, changeRole };
