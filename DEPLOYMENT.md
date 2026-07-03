# 部署指南

## Docker Compose 部署

### 1. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - APP_PASSWORD=${APP_PASSWORD}
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    restart: unless-stopped

volumes:
  data:
```

### 2. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. 启动

```bash
# 复制环境变量
cp .env.example .env
# 编辑 .env 填写密码和密钥

# 启动
docker compose up -d

# 查看日志
docker compose logs -f
```

### 4. 访问

打开 http://localhost:3000，输入密码登录。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| APP_PASSWORD | 是 | 登录密码 |
| SESSION_SECRET | 是 | JWT 签名密钥 |
| ACTUAL_SERVER_URL | 否 | Actual Budget 服务器地址 |
| ACTUAL_PASSWORD | 否 | Actual Budget 密码 |
| ACTUAL_BUDGET_ID | 否 | Actual Budget 预算 ID |

## 数据持久化

SQLite 数据库文件存储在 `/app/data/app.db`，通过 Docker volume 持久化。

## 备份

```bash
# 备份数据库
cp data/app.db data/app.db.backup

# 或使用 Docker
docker compose exec app cp /app/data/app.db /app/data/app.db.backup
```
