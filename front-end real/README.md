项目名称：安全增强型登录系统 (Security Enhanced  Login System)
项目初衷：
本项目旨在构建一个符合工业安全标准的登录系统。作为网络空间安全专业的学生，我希望通过此项目实践密码哈希加密、Docker 容器化管理以及前后端分离架构，解决传统明文存储或弱加密带来的安全风险。
技术栈：
1.	前端：React 19, Vite (追求极速的热更新体验)
2.	后端：Node.js, Express (高效处理 RESTful API)
3.	数据库：MongoDB (灵活的文档型数据库)
4.	安全技术：
 Bcrypt：采用 genSalt 增加计算成本，有效防御彩虹表及暴力破解。
 Crypto：调用系统级安全随机数生成器。
5.	部署：Docker 和 Docker Compose (实现一键环境同步)
已实现的安全性设计：
1.	加盐哈希存储：
 拒绝明文存储密码。
 每个用户拥有独立的随机盐值 (Salt)，即使密码相同，数据库中的哈希值也完全不同。
2.	高强度随机性：
 盐值生成依赖 Node.js 内置 crypto 模块，而非伪随机数。
3.	环境隔离：
 数据库与后端服务运行在独立的 Docker 容器中，通过内部网络通信，不直接暴露数据库端口。
项目进度：
 已完成：后端 API 开发 (注册与用户名查重)
 已完成：Bcrypt 安全加密逻辑实现
 已完成：MongoDB 数据库容器化部署
 开发中：登录认证逻辑 (Bcrypt.compare)
 计划中：JWT (JSON Web Token) 身份状态保持
 开发中：前端 React 交互页面
快速启动说明：
确保电脑已安装 Docker，在根目录执行以下命令：
docker-compose up --build
后端接口默认运行在：http://localhost:8080
