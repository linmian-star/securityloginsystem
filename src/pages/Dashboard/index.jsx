import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const goToUser = () => {
    // 这里的路径必须和你 router 里定义的 path 完全一致（注意大小写！）
    navigate('/User'); 
  };

  return (
    <div>
      <h2>这是仪表盘首页</h2>
      <button onClick={goToUser}>点击管理用户</button>
    </div>
  );
}

export default Dashboard
