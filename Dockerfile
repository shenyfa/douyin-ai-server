FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .

# 创建启动脚本
RUN echo '#!/bin/sh' > /opt/application/run.sh && \
    echo 'node /app/index.js' >> /opt/application/run.sh && \
    chmod +x /opt/application/run.sh

EXPOSE 8080

CMD ["/opt/application/run.sh"]
