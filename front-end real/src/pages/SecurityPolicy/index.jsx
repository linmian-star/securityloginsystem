import { useEffect, useState } from 'react';
import { getSecurityPolicy, updateSecurityPolicy } from '../../api/securityPolicy';
import { STORAGE_KEYS, DEFAULT_ROLE } from '../../constants/storageKeys';
import Message from '../../components/Message';
import './index.css';

function SecurityPolicy() {
  const [form, setForm] = useState({
    maxLoginAttempts: 5,
    lockDuration: 30,
    passwordMinLength: 6,
    tokenExpiry: 60,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [lastUpdated, setLastUpdated] = useState('');

  const currentRole = localStorage.getItem(STORAGE_KEYS.ROLE) || DEFAULT_ROLE;
  const isAdmin = currentRole === 'admin';

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      setLoading(true);
      const res = await getSecurityPolicy();
      const data = res.data.data;
      setForm({
        maxLoginAttempts: data.maxLoginAttempts,
        lockDuration: data.lockDuration,
        passwordMinLength: data.passwordMinLength,
        tokenExpiry: data.tokenExpiry,
      });
      if (data.updatedAt) {
        setLastUpdated(new Date(data.updatedAt).toLocaleString());
      }
    } catch (err) {
      console.error('读取安全策略失败', err);
      setMessage({ type: 'error', text: '读取安全策略失败，请检查登录状态' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    // 数字型字段统一转数字，空值兜底为 0
    const numValue = value === '' ? 0 : Number(value);
    setForm(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      setSaving(true);
      setMessage(null);
      const res = await updateSecurityPolicy(form);
      const data = res.data.data;
      setForm({
        maxLoginAttempts: data.maxLoginAttempts,
        lockDuration: data.lockDuration,
        passwordMinLength: data.passwordMinLength,
        tokenExpiry: data.tokenExpiry,
      });
      setLastUpdated(new Date(data.updatedAt).toLocaleString());
      setMessage({ type: 'success', text: '策略已保存，登录接口立即生效' });
    } catch (err) {
      console.error('保存安全策略失败', err);
      const msg = err?.response?.data?.message || '保存失败';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="sp-loading">正在加载安全策略...</div>;

  return (
    <div className="sp-container">
      <h2 className="sp-title">🛡️ 安全策略中心</h2>
      <p className="sp-desc">
        配置系统全局的登录安全、密码规范等规则。修改后登录接口与注册接口立即生效。
      </p>

      {!isAdmin && (
        <div className="sp-readonly-tip">
          ⚠️ 您当前为普通用户角色，仅可查看策略，修改请联系管理员。
        </div>
      )}

      {message && (
        <Message type={message.type}>{message.text}</Message>
      )}

      <form className="sp-form" onSubmit={handleSubmit}>
        <div className="sp-form-row">
          <label>
            <span>最大登录失败次数</span>
            <input
              type="number"
              min={1}
              value={form.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
              disabled={!isAdmin || saving}
            />
            <small>同一账号或同一 IP 连续失败达到此次数后，将触发锁定。</small>
          </label>

          <label>
            <span>账号锁定时长（分钟）</span>
            <input
              type="number"
              min={1}
              value={form.lockDuration}
              onChange={(e) => handleChange('lockDuration', e.target.value)}
              disabled={!isAdmin || saving}
            />
            <small>锁定后需等待该时长自动解锁（进程不中断）。</small>
          </label>
        </div>

        <div className="sp-form-row">
          <label>
            <span>注册密码最小长度</span>
            <input
              type="number"
              min={1}
              value={form.passwordMinLength}
              onChange={(e) => handleChange('passwordMinLength', e.target.value)}
              disabled={!isAdmin || saving}
            />
            <small>新用户注册时，密码长度不得小于此值。</small>
          </label>

          <label>
            <span>Token 有效期（分钟）</span>
            <input
              type="number"
              min={1}
              value={form.tokenExpiry}
              onChange={(e) => handleChange('tokenExpiry', e.target.value)}
              disabled={!isAdmin || saving}
            />
            <small className="sp-muted">
              当前仅作展示，登录 Token 仍固定为 1 小时，暂不动态生效。
            </small>
          </label>
        </div>

        <div className="sp-footer">
          {lastUpdated && (
            <span className="sp-updated">最后更新：{lastUpdated}</span>
          )}
          {isAdmin && (
            <button
              type="submit"
              className="sp-save-btn"
              disabled={saving}
            >
              {saving ? '保存中...' : '保存策略'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SecurityPolicy;
