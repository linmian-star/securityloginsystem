// 集中管理所有配置：环境变量读取 + 默认值 + 启动校验
// 其他文件只需 require('./config') 即可拿到所有配置，不再直接读 process.env

require('dotenv').config(); // 自包含：任何文件 require 此模块时都会加载 .env

const config = {
  // JWT 密钥（必需，没有就拒绝启动）
  JWT_SECRET: process.env.JWT_SECRET,

  // 服务端口
  PORT: process.env.PORT || 8080,

  // MongoDB 连接地址
  MONGO_URI: process.env.MONGO_URI || 'mongodb://mongodb:27017/security_system',

  // Redis 连接地址
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};

// Fail-fast：关键配置缺失就立刻退出，不让程序带病启动
if (!config.JWT_SECRET) {
  console.error('缺少 JWT_SECRET 环境变量，请在 back-end/.env 中配置');
  process.exit(1);
}

module.exports = config;
