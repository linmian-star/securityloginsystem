// 系统设置 API：系统运行信息
// 注意：修改密码属于 auth 业务，已在 api/auth.js 中导出 changePassword

import request from './request';

export function getSystemInfo() {
  return request.get('/api/system/info');
}
