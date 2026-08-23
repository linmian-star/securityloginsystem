import { useState } from 'react';
import { getRoles, changeRole } from '../../api/roles';
import useFetch from '../../hooks/useFetch';
import Message from '../../components/Message';
import './index.css';

// 权限对照表（前端写死，对应 Sidebar 里的菜单权限）
const PERMISSION_MATRIX = [
  { module: '查看仪表盘',     admin: true, user: true  },
  { module: '管理用户',       admin: true, user: true  },
  { module: '查看审计日志',   admin: true, user: false },
  { module: '修改安全策略',   admin: true, user: false },
  { module: '管理角色权限',   admin: true, user: false },
  { module: '系统设置',       admin: true, user: false },
];

function Roles() {
  const [activeRole, setActiveRole] = useState('admin'); // 当前展开查看的角色
  const [message, setMessage] = useState(null); // { type, text }

  // useFetch 替换原 useState(data) + useState(loading) + useEffect + fetchRoles 样板
  // 错误信息通过 onError 回调写入 message，与原"获取角色列表失败"兜底完全一致
  const { data, loading, refetch: fetchRoles } = useFetch(getRoles, {
    initialData: { admin: { count: 0, users: [] }, user: { count: 0, users: [] } },
    transform: (res) => res.data.data,
    onError: (err) => {
      const msg = err?.response?.data?.message || '获取角色列表失败';
      setMessage({ type: 'error', text: msg });
    },
  });

  // 切换某用户的角色（admin → user 或 user → admin）
  const handleChangeRole = async (username, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmText = `确定要把用户 "${username}" 从 ${currentRole} 改为 ${newRole} 吗？`;
    if (!window.confirm(confirmText)) return;

    try {
      setMessage(null);
      const res = await changeRole({ username, newRole });
      setMessage({ type: 'success', text: res.data.message });
      // 刷新数据
      await fetchRoles();
    } catch (err) {
      console.error('修改角色失败', err);
      const msg = err?.response?.data?.message || '修改角色失败';
      setMessage({ type: 'error', text: msg });
    }
  };

  if (loading) return <div className="roles-loading">正在加载角色信息...</div>;

  return (
    <div className="roles-container">
      <h2 className="roles-title">🔐 角色权限中心</h2>
      <p className="roles-desc">
        查看系统角色分布与权限配置，支持调整用户角色。
      </p>

      {message && (
        <Message type={message.type}>{message.text}</Message>
      )}

      {/* 角色卡片 */}
      <div className="roles-cards">
        <div
          className={`role-card role-card-admin ${activeRole === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveRole('admin')}
        >
          <div className="role-card-icon">🛡️</div>
          <div className="role-card-name">管理员 Admin</div>
          <div className="role-card-count">用户数：{data.admin.count}</div>
          <div className="role-card-perms">权限：6 项</div>
          <div className="role-card-action">点击查看成员</div>
        </div>

        <div
          className={`role-card role-card-user ${activeRole === 'user' ? 'active' : ''}`}
          onClick={() => setActiveRole('user')}
        >
          <div className="role-card-icon">👤</div>
          <div className="role-card-name">普通用户 User</div>
          <div className="role-card-count">用户数：{data.user.count}</div>
          <div className="role-card-perms">权限：2 项</div>
          <div className="role-card-action">点击查看成员</div>
        </div>
      </div>

      {/* 成员列表（紧跟在卡片下方，点击卡片立刻看到反馈） */}
      <div className="roles-section roles-members-section">
        <h3 className="roles-section-title">
          {activeRole === 'admin' ? '🛡️ 管理员' : '👤 普通用户'}成员列表
          <span className="roles-member-count-badge">
            共 {data[activeRole].count} 人
          </span>
        </h3>
        {data[activeRole].users.length === 0 ? (
          <div className="roles-empty">暂无成员</div>
        ) : (
          <table className="roles-table">
            <thead>
              <tr>
                <th>用户名</th>
                <th>注册时间</th>
                <th>当前角色</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {data[activeRole].users.map((u) => (
                <tr key={u.username}>
                  <td>{u.username}</td>
                  <td>{new Date(u.createdAt).toLocaleString()}</td>
                  <td>{u.role === 'admin' ? 'admin' : 'user'}</td>
                  <td>
                    <button
                      className="roles-btn roles-btn-primary"
                      onClick={() => handleChangeRole(u.username, u.role)}
                    >
                      {u.role === 'admin' ? '降级为 User' : '升级为 Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 权限对照表（移到最下面） */}
      <div className="roles-section">
        <h3 className="roles-section-title">权限对照表（只读）</h3>
        <table className="roles-table">
          <thead>
            <tr>
              <th>功能模块</th>
              <th>Admin</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MATRIX.map((row) => (
              <tr key={row.module}>
                <td>{row.module}</td>
                <td className="perm-cell">{row.admin ? '✅' : '❌'}</td>
                <td className="perm-cell">{row.user ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Roles;
