const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://mongodb:27017/security_system');
    console.log('MongoDB 连接成功');
  } catch (err) {
    console.error('连接失败', err);
    process.exit(1);
  }
};
module.exports = connectDB;
