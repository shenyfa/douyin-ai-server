# 使用Node.js 18作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（如果存在）
COPY server/package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制server目录内容
COPY server/ ./

# 暴露端口
EXPOSE 9000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=9000

# 启动应用
CMD ["node", "index.js"] 
