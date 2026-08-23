// 审计日志 API：列表（含筛选/分页） / 统计

import request from './request';

export function getAuditLogs(params) {
  return request.get('/api/audit-logs', { params });
}

// TODO: 后端已实现 GET /api/audit-logs/stats（管理员权限，返回审计日志统计数据）
// 当前前端由 /api/dashboard-stats 统一返回仪表盘数据，暂未使用本导出。
// 若未来需要把"审计统计"从仪表盘解耦为独立拉取，可直接从此接口拿。
export function getAuditLogStats() {
  return request.get('/api/audit-logs/stats');
}
