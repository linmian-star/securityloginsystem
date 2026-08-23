// 角色权限 API：角色列表 / 切换角色

import request from './request';

export function getRoles() {
  return request.get('/api/roles');
}

export function changeRole(data) {
  return request.put('/api/roles/change', data);
}
