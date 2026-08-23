import { useState, useEffect } from "react";
import { getAuditLogs } from '../../api/auditLogs';
import { ACTION_LABELS } from '../../constants/actionLabels';
import './index.css';

function AuditLogs() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  // 筛选条件
  const [filterAction, setFilterAction] = useState('');
  const [filterUsername, setFilterUsername] = useState('');

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: pagination.limit };
      if (filterAction) params.action = filterAction;
      if (filterUsername) params.username = filterUsername;

      const response = await getAuditLogs(params);
      setList(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("获取审计日志失败", err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => fetchLogs(1);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchLogs(newPage);
  };

  if (loading && list.length === 0) return <div>加载中...</div>;

  return (
    <div className="audit-container">
      <h2>日志审计</h2>

      {/* 筛选区 */}
      <div className="audit-filter">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">全部操作</option>
          {Object.entries(ACTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="按用户名筛选"
          value={filterUsername}
          onChange={(e) => setFilterUsername(e.target.value)}
        />

        <button className="search-btn" onClick={handleSearch}>查询</button>
      </div>

      {/* 日志表格 */}
      <table className="audit-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>用户名</th>
            <th>操作类型</th>
            <th>状态</th>
            <th>IP</th>
            <th>详情</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr className="empty-row">
              <td colSpan="6">暂无日志数据</td>
            </tr>
          ) : (
            list.map(item => (
              <tr key={item._id}>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.username}</td>
                <td>{ACTION_LABELS[item.action] || item.action}</td>
                <td className={item.status === 'fail' ? 'audit-status-fail' : 'audit-status-success'}>
                  {item.status === 'fail' ? '失败' : '成功'}
                </td>
                <td>{item.ip || '-'}</td>
                <td>{item.detail || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 分页 */}
      <div className="audit-pagination">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          上一页
        </button>
        <span>第 {pagination.page} / {pagination.pages || 1} 页（共 {pagination.total} 条）</span>
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
        >
          下一页
        </button>
      </div>
    </div>
  );
}

export default AuditLogs;
