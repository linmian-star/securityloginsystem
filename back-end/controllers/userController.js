// 用户管理 Controller：列表 / 删除
// 只负责 HTTP 层

const User = require('../models/User');
const { recordAuditLog } = require('../services/auditLogService');

// GET /api/users  获取用户列表（需要 token 验证）
async function getUsers(req, res) {
  try {
    const users = await User.find({}, 'username role createdAt');
    res.status(200).json({ code: 200, data: users });
  } catch (err) {
    console.error("获取用户列表失败:", err);
    res.status(500).json({ code: 500, message: '获取用户列表失败' });
  }
}

// DELETE /api/users/:id  删除用户（仅管理员）
async function deleteUser(req, res) {
  try {
    // 先查出要删的用户名，用于记日志
    const targetUser = await User.findById(req.params.id);
    await User.findByIdAndDelete(req.params.id);

    // 埋点：记录删除行为，操作者用 token 里的用户名
    await recordAuditLog({
      username: req.user.username, action: 'delete_user', status: 'success',
      detail: `删除了用户 ${targetUser?.username || req.params.id}`,
      ip: req.ip, userAgent: req.headers['user-agent']
    });

    res.status(200).json({ code: 200, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: '删除失败' });
  }
}

module.exports = { getUsers, deleteUser };
