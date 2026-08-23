// 菜单配置：以后加/改/删菜单只动这里，不用改 JSX
// 每个菜单项 = 图标 + 文字 + 路径 + 所需角色（不写 roles 表示所有角色都能看）
//
// 字段说明：
//   icon   emoji 图标
//   label  菜单显示文字
//   path   路由路径（与 App.jsx 中的 Route 对应）
//   roles  可选，允许访问的角色数组；不写 = 所有角色可见

export const menuList = [
  { icon: '📊', label: '仪表盘', path: '/dashboard' },
  { icon: '👤', label: '用户管理', path: '/users' },
  { icon: '📜', label: '日志审计', path: '/audit-logs', roles: ['admin'] },
  { icon: '🛡️', label: '安全策略', path: '/security-policy', roles: ['admin'] },
  { icon: '🔐', label: '角色权限', path: '/roles', roles: ['admin'] },
  { icon: '⚙️', label: '系统设置', path: '/settings', roles: ['admin'] },
];
