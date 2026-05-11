# 1. 基础镜像：告诉 Docker 我们的代码需要运行在有 Node.js 的环境里
FROM m.daocloud.io/docker.io/library/node:18


# 2. 工作目录：在容器内部创建一个名叫 /app 的文件夹，后续操作都在这里
WORKDIR /app

# 3. 复制依赖清单：先把 package.json 拷进去
# 这样 Docker 可以先根据它安装插件
COPY package*.json ./

# 4. 执行安装：在容器里运行 npm install，把后端需要的工具箱装好
RUN npm install

# 5. 复制源码：把当前 backend 文件夹下的所有代码（比如 server.js）都拷进容器
COPY . .

# 6. 暴露端口：告诉 Docker 后端程序会用到 8080 端口
EXPOSE 8080

# 7. 启动指令：容器启动时，执行 node server.js 来运行你的后端
CMD ["node", "server.js"]
