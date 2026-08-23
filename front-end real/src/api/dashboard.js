// 仪表盘 API：统计数据

import request from './request';

export function getDashboardStats() {
  return request.get('/api/dashboard-stats');
}
