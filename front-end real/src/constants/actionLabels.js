// 审计日志操作类型 → 中文显示文案的映射
//
// 后端 AuditLog 的 action 字段使用 snake_case 英文标识，
// 前端展示时统一通过此映射转成中文；未匹配的 action 会回退显示原值。
//
// 后端新增 action 类型时，只需在此映射里加一行即可。

export const ACTION_LABELS = {
  login_success: '登录成功',
  login_failed: '登录失败',
  register: '注册',
  delete_user: '删除用户'
};
