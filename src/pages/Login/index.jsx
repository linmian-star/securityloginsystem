import {useNavigate} from "react-router-dom";
function Login() {
    const navigate=useNavigate();
    const handleLogin=()=>{
        const token="123456";
        localStorage.setItem("token",token)
            navigate("/Dashboard",{replace:true})
    }
    return(
        <div>
            <h2>登录页面</h2>
            <input placeholder="请输入用户名" />
            <br/><br/>
            <input placeholder="请输入密码" type="password" />
            <br/><br/>

        <button onClick={handleLogin}>登录</button>
        </div>
    )
    
}
export default Login;
