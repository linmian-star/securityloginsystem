import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // 引入你写的侧边栏
import { STORAGE_KEYS } from "../constants/storageKeys";
import "./MainLayout.css";
import { useNavigate } from 'react-router-dom';

function MainLayout() {
  const navigate = useNavigate();
  const handleLogout=()=>{
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);   // 退出时连角色一起清掉，避免下次登录残留旧角色
    localStorage.removeItem(STORAGE_KEYS.USERNAME); // 用户名也清掉，避免设置页残留
    navigate("/login", { replace: true });
  }
  return (
    <div className="main-layout">
      {/* 1. 左侧固定栏 */}
      <aside className="sidebar-container">
        <Sidebar />
      </aside>

      {/* 2. 右侧主体区 */}
      <main className="content-container">
        {/* 顶栏也可以放这里 */}
        <header className="top-header">
          <span>安全增强后台登录系统后台</span>
          <button onClick= {handleLogout }>退出</button>
        </header>

        {/*  最关键的一行：子页面的“展位” */}
        <section className="page-content">
          <Outlet /> 
        </section>
      </main>
    </div>
  );
}

export default MainLayout;

