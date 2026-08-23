// 用户管理 API：列表 / 删除

import request from './request';

export function getUsers() {
  return request.get('/api/users');
}

export function deleteUser(id) {
  return request.delete(`/api/users/${id}`);
}
