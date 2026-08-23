// 安全策略服务：读/初始化系统级单文档策略
// 从 server.js 原样迁移，不修改任何业务逻辑

const SecurityPolicy = require('../models/SecurityPolicy');

// 读/初始化安全策略（永远只有一条，不存在就创建默认值）
const getOrCreatePolicy = async () => {
  let policy = await SecurityPolicy.findOne({});
  if (!policy) {
    policy = await SecurityPolicy.create({}); // 使用 Schema 默认值
  }
  return policy;
};

module.exports = { getOrCreatePolicy };
