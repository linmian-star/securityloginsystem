import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import "./index.css"
import bgImage from "../../assets/Login-bg.png";

function Login() {
  const navigate = useNavigate();
  // 2. 定义两个变量来存输入的内容
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");// {/* 受控组件 */}

  const handleLogin = () => {
    // 3. 简单的逻辑判断（模拟后端验证）
    if (username === "admin" && password === "123456") {
      const token = "123456";
      localStorage.setItem("token", token);
      
      //  {/*replace实现代替
      // ，用户返回不会退回之前的页面 */}
      navigate("/Dashboard", { replace: true });
    } else {
      alert("用户名或密码错误！(测试用: admin/123456)");
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
        登 录
      </button>
    </div>
  </div>
);

}

export default Login;

