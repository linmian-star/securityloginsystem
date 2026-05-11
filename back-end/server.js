require('dotenv').config(); // 加载 .env 文件中的环境变量
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // 引入用户模型
const bcrypt = require('bcryptjs');
 // 用于密码哈希
 const crypto=require('crypto'); // 用于生成随机盐值
 if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = crypto;
}


const app = express();
app.use(cors()); // 解决你最担心的跨域问题
app.use(express.json());

const SECRET_KEY = 'your_security_secret';
 // 安全密钥
const connectDB = require('./config/db');
connectDB(); // 启动时连接数据库

const verifyToken = (req, res, next) => {
  // 1. 从请求头拿到 Authorization
  const authHeader = req.headers['authorization'];
  // 这里的格式通常是 "Bearer <token>"，所以要用 split 分割
  const token =  authHeader?.split(' ')[1];

  // 2. 如果根本没带 Token
  if (!token) {
    return res.status(403).json({ message: '拒绝访问：没有令牌！' });
  }

  // 3. 校验 Token 是否合法/过期
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: '令牌无效或已过期' });
    }
    // 4. 校验通过，把用户信息存入 req，方便后面使用
    req.user = user;
    // 5. 放行！去执行下一个函数
    next(); 
  });
};
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
   

    // 检查是否已存在
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ code: 400, message: '用户名已存在' });

    // 密码加盐哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      password: hashedPassword
    });

    await user.save();
    res.status(200).json({ code: 200, message: '注册成功' });
  } catch (err) {
    console.error("authentic error stack:", err);
    res.status(500).json({ code: 500, message: '注册失败', error: err.message,stack:err.stack});
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. 去 MongoDB 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    // 2. 比较加密后的密码（数据库存的是哈希，req.body 是明文）
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' });
    }

    // 3. 验证成功，生成 Token (存入用户 ID 和 用户名)
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ code: 200, message: '登录成功', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: '服务器内部错误' });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`后端服务已在 ${PORT} 端口启动`));

