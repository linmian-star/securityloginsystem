// 审计日志服务：统一封装 AuditLog.create，失败不影响主流程
// 从 server.js 9 处重复的 try/catch 模式提取而来

const AuditLog = require('../models/AuditLog');

/**
 * 写一条审计日志。失败时只打印警告，不抛错，不影响主流程。
 * @param {Object} params - 日志字段
 * @param {string} params.username - 用户名
 * @param {string} params.action - 操作类型（login_success / login_failed / register / delete_user / role_change / password_change）
 * @param {string} [params.status='success'] - 状态（success / fail）
 * @param {string} [params.detail=''] - 详情
 * @param {string} [params.ip=''] - IP 地址
 * @param {string} [params.userAgent=''] - User-Agent
 */
const recordAuditLog = async ({ username, action, status = 'success', detail = '', ip = '', userAgent = '' }) => {
  try {
    await AuditLog.create({ username, action, status, detail, ip, userAgent });
  } catch (logErr) {
    console.error('审计日志写入失败:', logErr.message);
  }
};

module.exports = { recordAuditLog };
