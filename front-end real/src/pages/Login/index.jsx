import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth"; // 引入 API 模块（封装 /login 调用）
import { STORAGE_KEYS, DEFAULT_ROLE, DEFAULT_USERNAME } from "../../constants/storageKeys";
import "./index.css"
import bgImage from "../../assets/Login-bg.png";

function Login() {
  const navigate = useNavigate();
  // 2. 定义两个变量来存输入的内容
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");// {/* 受控组件 */}

 const handleLogin = async () => {
  try {
    // 调用 API 模块（URL/baseURL/拦截器全部封装在 api/auth.js + api/request.js 里）
    const res = await login({
      username: username,
      password: password
    });

    if (res.data.code === 200) {
      console.log('登录成功，拿到 Token:', res.data.token);
      localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
      localStorage.setItem(STORAGE_KEYS.ROLE, res.data.role || DEFAULT_ROLE);  // 存角色，给侧边栏过滤用
      localStorage.setItem(STORAGE_KEYS.USERNAME, res.data.username || DEFAULT_USERNAME);  // 存用户名，给设置页/审计页用
      navigate('/dashboard'); // 成功后跳转（与 router/menuList 统一小写，避免部署时大小写敏感）
    }
  } catch (err) {
    console.error('登录失败，后端报错了:', err.response?.data?.message || err.message);
    alert('账号或密码不对哦');
  }
};


  return (

  <div className="login-container">
    <img src={bgImage} alt="背景图" className="background-image" />
    <div className="login-box">
      <h2>安全后台系统登录</h2>
      
      <div className="input-group">
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button 
        className="login-button" 
        onClick={handleLogin}
        disabled={!username || !password} 
      >
      登录
      </button>

      <div className="register-link">
        还没有账号？<span onClick={() => navigate('/register')}>去注册</span>
      </div>
    </div>
  </div>
);

}

export default Login;

