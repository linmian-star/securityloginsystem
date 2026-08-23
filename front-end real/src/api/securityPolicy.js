// 安全策略 API：读取 / 修改

import request from './request';

export function getSecurityPolicy() {
  return request.get('/api/security-policy');
}

export function updateSecurityPolicy(data) {
  return request.put('/api/security-policy', data);
}
