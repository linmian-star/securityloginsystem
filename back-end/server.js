// 进程入口：只负责连接数据库 + 启动 HTTP Server
// Express app 的创建、middleware、routes 全部在 ./app 里

const { PORT } = require('./config');
const connectDB = require('./config/db');

const app = require('./app');

connectDB(); // 启动时连接数据库

app.listen(PORT, '0.0.0.0', () => console.log(`后端服务已在 ${PORT} 端口启动`));
