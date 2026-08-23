const mongoose = require('mongoose');
const { MONGO_URI } = require('./index'); // 从集中配置读取连接地址

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB 连接成功');
  } catch (err) {
    console.error('连接失败', err);
    process.exit(1);
  }
};
module.exports = connectDB;
