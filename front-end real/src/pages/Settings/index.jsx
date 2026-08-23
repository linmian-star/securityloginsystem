import { useState } from 'react';
import { getSystemInfo } from '../../api/system';
import { changePassword } from '../../api/auth';
import { STORAGE_KEYS, DEFAULT_ROLE, DEFAULT_USERNAME } from '../../constants/storageKeys';
import useFetch from '../../hooks/useFetch';
import Message from '../../components/Message';
import './index.css';

function Settings() {
  const [activeTab, setActiveTab] = useState('system'); // system | password

  // 系统信息部分：用 useFetch 替换原 useState×3 + useEffect + fetchSystemInfo 样板
  // refetch 直接复用为"重新加载"按钮的回调
  const { data: systemInfo, loading: loadingSystem, error: systemError, refetch: fetchSystemInfo } = useFetch(
    getSystemInfo,
    {
      initialData: null,
      transform: (res) => res.data.data,
    }
  );

  // 修改密码表单
  const [pwdForm, setPwdForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMessage, setPwdMessage] = useState(null); // { type, text }
  const [savingPwd, setSavingPwd] = useState(false);

  // 当前登录用户（从 localStorage 拿，用于"修改密码"页头部展示）
  const currentUsername = localStorage.getItem(STORAGE_KEYS.USERNAME) || DEFAULT_USERNAME;
  const currentRole = localStorage.getItem(STORAGE_KEYS.ROLE) || DEFAULT_ROLE;

  const handlePwdChange = (field, value) => {
    setPwdForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdMessage(null);

    // 前端校验：两次密码一致
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: '新密码长度至少需要 6 位' });
      return;
    }

    try {
      setSavingPwd(true);
      const res = await changePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword
      });
      setPwdMessage({ type: 'success', text: res.data.message });
      // 清空表单
      setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('修改密码失败', err);
      const msg = err?.response?.data?.message || '修改密码失败';
      setPwdMessage({ type: 'error', text: msg });
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">⚙️ 系统设置</h2>

      {/* Tab 切换 */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          📊 系统信息
        </button>
        <button
          className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          🔑 修改密码
        </button>
      </div>

      {/* 系统信息 Tab */}
      {activeTab === 'system' && (
        <div className="settings-panel">
          {loadingSystem ? (
            <div className="settings-loading">正在加载系统信息...</div>
          ) : systemError ? (
            <div className="settings-error-block">
              <div className="settings-error-title">⚠️ 获取系统信息失败</div>
              <div className="settings-error-detail">{systemError}</div>
              <button className="settings-refresh-btn" onClick={fetchSystemInfo}>
                🔄 重新加载
              </button>
            </div>
          ) : systemInfo ? (
            <>
              <table className="settings-info-table">
                <tbody>
                  <tr>
                    <th>后端运行环境</th>
                    <td>{systemInfo.nodeVersion}</td>
                  </tr>
                  <tr>
                    <th>运行时长</th>
                    <td>{systemInfo.uptime}</td>
                  </tr>
                  <tr>
                    <th>注册用户总数</th>
                    <td>{systemInfo.userCount}</td>
                  </tr>
                  <tr>
                    <th>MongoDB 状态</th>
                    <td>
                      <span className={`status-badge ${systemInfo.mongoStatus === 'connected' ? 'status-ok' : 'status-fail'}`}>
                        {systemInfo.mongoStatus === 'connected' ? '🟢 已连接' : '🔴 未连接'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>Redis 状态</th>
                    <td>
                      <span className={`status-badge ${systemInfo.redisStatus === 'connected' ? 'status-ok' : 'status-fail'}`}>
                        {systemInfo.redisStatus === 'connected' ? '🟢 已连接' : '🔴 未连接'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th>当前登录用户</th>
                    <td>{systemInfo.currentUsername} ({systemInfo.currentRole})</td>
                  </tr>
                  <tr>
                    <th>JWT 过期时间</th>
                    <td>{systemInfo.jwtExpiry}</td>
                  </tr>
                </tbody>
              </table>
              <button className="settings-refresh-btn" onClick={fetchSystemInfo}>
                🔄 刷新状态
              </button>
            </>
          ) : null}
        </div>
      )}

      {/* 修改密码 Tab */}
      {activeTab === 'password' && (
        <div className="settings-panel">
          <div className="settings-current-user">
            当前用户：<strong>{currentUsername}</strong>
            <span className="settings-role-tag">({currentRole})</span>
          </div>

          {pwdMessage && (
            <Message type={pwdMessage.type}>{pwdMessage.text}</Message>
          )}

          <form className="settings-pwd-form" onSubmit={handlePwdSubmit}>
            <label>
              <span>当前密码</span>
              <input
                type="password"
                value={pwdForm.oldPassword}
                onChange={(e) => handlePwdChange('oldPassword', e.target.value)}
                placeholder="请输入当前密码"
                required
                autoComplete="current-password"
              />
            </label>
            <label>
              <span>新密码</span>
              <input
                type="password"
                value={pwdForm.newPassword}
                onChange={(e) => handlePwdChange('newPassword', e.target.value)}
                placeholder="至少 6 位"
                required
                autoComplete="new-password"
              />
            </label>
            <label>
              <span>确认新密码</span>
              <input
                type="password"
                value={pwdForm.confirmPassword}
                onChange={(e) => handlePwdChange('confirmPassword', e.target.value)}
                placeholder="再次输入新密码"
                required
                autoComplete="new-password"
              />
            </label>

            <div className="settings-pwd-actions">
              <button
                type="button"
                className="settings-btn settings-btn-cancel"
                onClick={() => {
                  setPwdForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setPwdMessage(null);
                }}
                disabled={savingPwd}
              >
                清空
              </button>
              <button type="submit" className="settings-btn settings-btn-save" disabled={savingPwd}>
                {savingPwd ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Settings;
