import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";
import "./index.css";
import bgImage from "../../assets/Login-bg.png";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    // 表单验证
    if (!username || !password || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少为 6 位");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次密码输入不一致");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const res = await register({
        username: username,
        password: password
      });

      if (res.data.code === 200) {
        alert('注册成功，请登录');
        navigate('/login');
      }
    } catch (err) {
      console.error('注册失败:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <img src={bgImage} alt="背景图" className="background-image" />
      <div className="register-box">
        <h2>安全后台系统注册</h2>
        
        {error && <div className="error-message">{error}</div>}

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
            placeholder="密码（至少 6 位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button 
          className="register-button" 
          onClick={handleRegister}
          disabled={loading || !username || !password || !confirmPassword}
        >
          {loading ? '注册中...' : '注册'}
        </button>

        <div className="login-link">
          已有账号？<span onClick={() => navigate('/login')}>去登录</span>
        </div>
      </div>
    </div>
  );
}

export default Register;
