// 认证相关 API：登录 / 注册 / 改密码
// 注意：/login 和 /register 历史上不带 /api 前缀（前端已依赖，不要改）
// /api/auth/password 才带 /api 前缀

import request from './request';

export function login(data) {
  return request.post('/login', data);
}

export function register(data) {
  return request.post('/register', data);
}

export function changePassword(data) {
  return request.put('/api/auth/password', data);
}
