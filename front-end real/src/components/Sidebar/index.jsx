// Sidebar 组件：只负责侧边栏 UI 和菜单渲染
//
// 职责分离：
//   - 菜单配置 → constants/menuList.js
//   - 角色判断 → hooks/usePermission.js
//   - 样式    → Sidebar.css（原 inline style 全部迁出）
//
// 本文件只做：读菜单配置 → 用 usePermission 过滤 → 渲染 NavLink

import { NavLink } from "react-router-dom";
import { menuList } from '../../constants/menuList';
import usePermission from '../../hooks/usePermission';
import './Sidebar.css';

function Sidebar() {
  const { hasRole } = usePermission();

  // 过滤菜单：菜单要求 admin 但当前用户不是 admin，就藏起来
  const visibleMenus = menuList.filter(item => hasRole(item.roles));

  return (
    <div className="sidebar">
      <h3>后台系统</h3>
      {visibleMenus.map(item => (
        <div key={item.path} className="sidebar-item">
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
            }
          >
            {item.icon} {item.label}
          </NavLink>
        </div>
      ))}
    </div>
  );
}

export default Sidebar;
