// 一次性脚本：把指定用户升级为 admin
// 用法：docker exec securityloginsystem-api-1 node scripts/seedAdmin.js diag2
// （第二个参数是要升级的用户名，不传默认升 diag2）
require('dotenv').config();
const mongoose = require('mongoose');
// crypto 兜底：跟 server.js 顶部那段一样，避免脚本独立运行时 crypto 未定义
const crypto = require('crypto');
if (typeof globalThis.crypto === 'undefined') { globalThis.crypto = crypto; }
const User = require('../models/User');

const username = process.argv[2] || 'diag2';

const connectDB = require('../config/db');

(async () => {
  try {
    await connectDB();
    const result = await User.findOneAndUpdate(
      { username },
      { role: 'admin' },
      { new: true }
    );
    if (!result) {
      console.log(`❌ 找不到用户 "${username}"，请先注册`);
      process.exit(1);
    }
    console.log(`✅ 已把 "${result.username}" 升级为 admin`);
    process.exit(0);
  } catch (err) {
    console.error('升级失败:', err.message);
    process.exit(1);
  }
})();
