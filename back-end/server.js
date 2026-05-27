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
// 💡 在后端 server.js 中追加这个路由，供前端仪表盘调用
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        // 1. 从 MongoDB 中动态查询当前总共有多少个注册用户
        // 这里的 User 是你定义的 Mongoose Model
        const realUserCount = await User.countDocuments({}); 

        // 2. 返回 JSON 数据给前端（格式必须和前端的 useState 对应上）
        res.status(200).json({
            userCount: realUserCount,       // 这里的数量会随着你 Postman 注册新用户而动态增加！
            abnormalLogins: 5,              // 今日异常登录（防爆破拦截数，可先写死，后续接日志表）
            onlineRate: "99.8%",            // 系统在线率
            securityRating: "A+",           // 系统安全评级
            trendData: [                    // 下方图表的历史审计趋势
                { month: '1月', count: 45 },
                { month: '2月', count: 85 },
                { month: '3月', count: 92 },
                { month: '4月', count: 130 },
                { month: '5月', count: realUserCount } // 让5月的柱状图直接反映数据库真实人数
            ]
        });
    } catch (err) {
        console.error("后端统计接口崩溃:", err.stack);
        res.status(500).json({ message: "获取安全指标失败", error: err.message });
    }
});

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
// 💡 这是一个专门给前端仪表盘提供数据的 GET 接口
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        // 1. 【这是真的】去 MongoDB 数据库里，数一数你现在到底注册了几个用户
        // 哪怕你现在只有 1 个测试用户，count 也会精准拿到 1
        const realUserCount = await User.countDocuments({}); 

        // 2. 【这是模拟的】因为你现在还没写“登录爆破”和“日志审计”的功能，所以这些安全数据先写死
        res.status(200).json({
            userCount: realUserCount,       // 👈 真实数据：绑定数据库
            abnormalLogins: 3,              // 模拟：今日拦截爆破 3 次
            onlineRate: "99.9%",            // 模拟：系统在线率
            securityRating: "A+",           // 模拟：安全评级
            trendData: [
                { month: '3月', count: 0 },
                { month: '4月', count: 2 }, 
                { month: '5月', count: realUserCount } // 👈 真实数据：让 5 月的柱子高度等于你数据库的真实人数！
            ]
        });
    } catch (err) {
        res.status(500).json({ message: "后端统计失败", error: err.message });
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

