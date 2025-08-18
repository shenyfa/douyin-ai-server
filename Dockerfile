# 选用国内可用的 node 基础镜像
FROM node:18-alpine

WORKDIR /app

# 先拷贝依赖清单再安装，充分利用缓存
COPY package*.json ./

# 仅安装生产依赖（兼容 npm 不同版本）
RUN npm ci --omit=dev || npm install --only=production

# 再拷贝其余源码
COPY . .

ENV NODE_ENV=production
# 抖音云会注入 PORT 环境变量；确保监听 0.0.0.0
ENV HOST=0.0.0.0

# 如果你的入口文件是 index.js：
CMD ["node", "index.js"] 
