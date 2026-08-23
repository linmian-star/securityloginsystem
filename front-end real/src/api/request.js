// 统一封装 axios 实例 + 通用配置
// 原内容来自 src/api/axios.js，只换了文件名（让 API 模块引用 request 更语义化）
// baseURL / 请求拦截器 / 响应拦截器 / 401 处理逻辑全部保持不变

import axios from 'axios';
import { STORAGE_KEYS } from '../constants/storageKeys';

const service = axios.create({
  baseURL: 'http://localhost:8080'
});

// 请求拦截器：每一封发往后端的信，都自动贴上 Token 邮票
service.interceptors.request.use(config => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：Token 无效或过期时清除登录态并跳回登录页
service.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ROLE);   // token 失效时角色也清掉
      localStorage.removeItem(STORAGE_KEYS.USERNAME); // 同步清掉用户名，避免设置页残留
      // 避免停留在已失效的页面上看到空数据；登录页自身的 401（密码错误）不跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default service;
