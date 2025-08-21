FROM node:18-alpine

WORKDIR /app

# 先装依赖
COPY package*.json ./
RUN npm ci --omit=dev || npm install --only=production

# 再拷贝源码（根目录就是 index.js 等）
COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000
EXPOSE 9000

COPY run.sh /opt/application/run.sh
RUN chmod +x /opt/application/run.sh
CMD ["/opt/application/run.sh"]
