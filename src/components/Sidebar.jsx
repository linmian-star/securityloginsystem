import {NavLink} from "react-router-dom";
function Sidebar(){
    return (
        <div style={{padding:"20px"}}>
            <h3>后台系统</h3>
        <div>
            <NavLink to="/pages/Dashboard">首页</NavLink>
        </div>
        <div>
            <NavLink to="/pages/user">用户管理</NavLink>
        </div>
        </div>
    )
}
export default  Sidebar
