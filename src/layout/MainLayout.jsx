import Sidebar from "../components/Sidebar"
import {Outlet} from "react-router-dom"
import "./MainLayout.css"


function MainLayout()
{
    return(
        <div className="layout">
      
      {/* 左侧 */}
      <div className="Sidebar">
        侧边栏
      </div>

      {/* 右侧 */}
      <div className="main">
        
        {/* 顶部 */}
        <div className="header">
          顶部栏
        </div>

        {/* 内容 */}
        <div className="content">
          内容区
        </div>

      </div>
      <div><Outlet /></div>
    </div>
  )
}

export default MainLayout
          
    
