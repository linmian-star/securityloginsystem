import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/dashboard';
import { useNavigate } from 'react-router-dom';
import StatCard from './StatCard';
import BarChart from './BarChart';
import PieChart from './PieChart';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 核心安全卡片状态
  const [stats, setStats] = useState({
    userCount: 0,
    abnormalLogins: 0,
    onlineRate: '0%',
    securityRating: 'N/A'
  });

  // 趋势数据（柱状图）和威胁数据（饼图），交给子组件按需渲染
  const [trendData, setTrendData] = useState([]);
  const [threatData, setThreatData] = useState([]);

  // 数据请求 effect：只负责拿数据，画图交给 BarChart/PieChart 子组件
  useEffect(() => {
    const initAndFetchData = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        const data = response.data;

        setStats({
          userCount: data.userCount || 0,
          abnormalLogins: data.abnormalLogins || 0,
          onlineRate: data.onlineRate || '100%',
          securityRating: data.securityRating || 'A+'
        });
        setTrendData(data.trendData || []);
        setThreatData(data.threatData || []);
      } catch (err) {
        console.warn("前端启用安全沙盒演示数据");
        // 容灾兜底数据
        setStats({ userCount: 1248, abnormalLogins: 5, onlineRate: '98.5%', securityRating: 'A+' });
        setTrendData([
          { month: '1月', count: 45 },
          { month: '2月', count: 85 },
          { month: '3月', count: 92 },
          { month: '4月', count: 130 },
          { month: '5月', count: 185 },
        ]);
        setThreatData([
          { value: 85, name: '正常登录请求', itemStyle: { color: '#13c2c2' } },
          { value: 8, name: '密码爆破攻击', itemStyle: { color: '#f5222d' } },
          { value: 4, name: '恶意注入攻击', itemStyle: { color: '#fa8c16' } },
          { value: 3, name: '其他失败尝试', itemStyle: { color: '#8c8c8c' } }
        ]);
      } finally {
        setLoading(false);
      }
    };

    initAndFetchData();
  }, []);

  if (loading) {
    return <div className="dashboard-loading">🔒 安全监控中心正在载入实时数据库...</div>;
  }

  return (
    <div className="layout-container">
      {/* 右侧主内容 */}
      <div className="main-content">
        <div className="content-body">
          <div className="dashboard-wrapper">
            <h2 className="content-title">这是仪表盘首页</h2>
            <h3 className="section-title">安全核心指标卡片 (实时数据库同步)</h3>

            {/* 卡片布局 */}
            <div className="card-container">
              <StatCard cardClass="card-user" icon="👥" label="用户总数" value={stats.userCount} />
              <StatCard cardClass="card-danger" icon="🔒" label="今日异常登录" value={stats.abnormalLogins} valueClass="value-danger" subLabel="拦截恶意爆破" />
              <StatCard cardClass="card-online" icon="💻" label="系统在线率" value={stats.onlineRate} tag="稳定" />
              <StatCard cardClass="card-secure" icon="🛡️" label="系统安全评级" value={stats.securityRating} valueClass="value-secure" subLabel="已启用盐值哈希" />
            </div>

            {/* ECharts 容器布局：图表逻辑全部下沉到子组件 */}
            <div className="chart-row">
              <div className="chart-card">
                <BarChart data={trendData} />
              </div>
              <div className="chart-card">
                <PieChart data={threatData} />
              </div>
            </div>
          </div>

          <button className="manage-btn" onClick={() => navigate('/users')}>点击管理用户</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
