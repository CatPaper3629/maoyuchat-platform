# 部署指南

本文档提供聊天平台的完整部署指南，包括开发环境、生产环境和云部署的详细步骤。

## 📋 目录

- [前置要求](#前置要求)
- [开发环境部署](#开发环境部署)
- [生产环境部署](#生产环境部署)
- [云平台部署](#云平台部署)
- [故障排查](#故障排查)

---

## 前置要求

### 系统要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 8+) / Windows 10+ / macOS 10.15+
- **CPU**: 2核或更高
- **内存**: 4GB或更高
- **磁盘**: 20GB或更高可用空间

### 软件要求

- **Node.js**: 18.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **Redis**: 7.0 或更高版本
- **Docker**: 20.10+（可选）
- **Docker Compose**: 2.0+（可选）
- **Nginx**: 1.18+（生产环境）
- **PM2**: 5.0+（生产环境进程管理）

---

## 开发环境部署

### 方式一：使用 Docker Compose（推荐）

#### 1. 克隆项目

```bash
git clone <repository-url>
cd microservice_project
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的参数：

```env
# 数据库配置
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=chat_user
MYSQL_PASSWORD=chat_password
MYSQL_DATABASE=chat_platform

# Redis 配置
REDIS_URL=redis://redis:6379

# JWT 密钥
JWT_SECRET=your-secret-key-change-in-production

# MinIO 配置
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=chat-platform

# 服务端口
USER_SERVICE_PORT=8083
CHAT_SERVICE_PORT=8084
GROUP_SERVICE_PORT=8085
WEBSOCKET_PORT=3001
```

#### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 4. 访问应用

- **前端**: http://localhost:3000
- **后台管理**: http://localhost:3002
- **WebSocket**: ws://localhost:3001
- **MinIO 控制台**: http://localhost:9001（用户名: minioadmin，密码: minioadmin123）

### 方式二：本地开发部署

#### 1. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装各服务依赖
cd frontend && npm install
cd ../websocket && npm install
cd ../services/user && npm install
cd ../services/chat && npm install
cd ../services/group && npm install
cd ../admin && npm install
```

#### 2. 启动数据库服务

```bash
# 启动 MySQL、Redis、MinIO
docker-compose up -d mysql redis minio
```

#### 3. 初始化数据库

```bash
# 连接到 MySQL 并执行初始化脚本
mysql -h localhost -u root -p < database/mysql/init.sql
```

#### 4. 启动后端服务

```bash
# WebSocket 服务
cd websocket
npm run dev

# 用户服务（新终端）
cd services/user
npm run dev

# 聊天服务（新终端）
cd services/chat
npm run dev

# 群组服务（新终端）
cd services/group
npm run dev
```

#### 5. 启动前端应用

```bash
# 前端
cd frontend
npm run dev

# 后台管理（新终端）
cd admin
npm run dev
```

#### 6. 访问应用

- **前端**: http://localhost:5173
- **后台管理**: http://localhost:3002

---

## 生产环境部署

### 1. 服务器准备

#### 1.1 安装必要软件

**Ubuntu/Debian:**

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MySQL
sudo apt-get install -y mysql-server

# 安装 Redis
sudo apt-get install -y redis-server

# 安装 Nginx
sudo apt-get install -y nginx

# 安装 PM2
sudo npm install -g pm2

# 安装 Docker（可选）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**CentOS/RHEL:**

```bash
# 更新系统
sudo yum update -y

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 MySQL
sudo yum install -y mysql-server

# 安装 Redis
sudo yum install -y redis

# 安装 Nginx
sudo yum install -y nginx

# 安装 PM2
sudo npm install -g pm2

# 安装 Docker（可选）
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

#### 1.2 配置 MySQL

```bash
# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 创建数据库和用户
sudo mysql -u root -p

# 在 MySQL 中执行以下命令
CREATE DATABASE chat_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'chat_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON chat_platform.* TO 'chat_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 1.3 配置 Redis

```bash
# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis

# 配置 Redis 密码
sudo nano /etc/redis/redis.conf
# 找到 requirepass，取消注释并设置密码
# requirepass your_redis_password

# 重启 Redis
sudo systemctl restart redis
```

#### 1.4 安装 MinIO

```bash
# 下载 MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin/

# 创建 MinIO 用户和目录
sudo useradd -r minio-user
sudo mkdir -p /data/minio
sudo chown minio-user:minio-user /data/minio

# 配置 MinIO 服务
sudo nano /etc/systemd/system/minio.service
```

添加以下内容：

```ini
[Unit]
Description=MinIO Object Storage
After=network.target

[Service]
Type=simple
User=minio-user
Group=minio-user
Environment="MINIO_ROOT_USER=minioadmin"
Environment="MINIO_ROOT_PASSWORD=minioadmin123"
ExecStart=/usr/local/bin/minio server /data/minio --console-address ":9001"
Restart=always

[Install]
WantedBy=multi-user.target
```

启动 MinIO：

```bash
sudo systemctl daemon-reload
sudo systemctl start minio
sudo systemctl enable minio
```

### 2. 部署后端服务

#### 2.1 克隆项目并安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd microservice_project

# 安装依赖
cd services/user && npm install --production
cd ../chat && npm install --production
cd ../group && npm install --production
cd ../websocket && npm install --production
```

#### 2.2 配置环境变量

为每个服务创建 `.env` 文件：

```env
# services/user/.env
PORT=8083
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=chat_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=chat_platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production

# services/chat/.env
PORT=8084
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=chat_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=chat_platform
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=chat-platform

# services/group/.env
PORT=8085
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=chat_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=chat_platform
REDIS_URL=redis://localhost:6379

# websocket/.env
PORT=3001
NODE_ENV=production
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=chat_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=chat_platform
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
```

#### 2.3 初始化数据库

```bash
mysql -u chat_user -p chat_platform < database/mysql/init.sql
```

#### 2.4 使用 PM2 启动服务

```bash
# 启动用户服务
pm2 start services/user/src/index.js --name user-service

# 启动聊天服务
pm2 start services/chat/src/index.js --name chat-service

# 启动群组服务
pm2 start services/group/src/index.js --name group-service

# 启动 WebSocket 服务
pm2 start websocket/src/index.js --name websocket-service

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
```

#### 2.5 查看服务状态

```bash
# 查看所有服务
pm2 list

# 查看日志
pm2 logs

# 查看特定服务日志
pm2 logs user-service

# 重启服务
pm2 restart user-service

# 停止服务
pm2 stop user-service
```

### 3. 部署前端应用

#### 3.1 构建前端

```bash
# 构建前端应用
cd frontend
npm install
npm run build

# 构建后台管理
cd ../admin
npm install
npm run build
```

#### 3.2 配置 Nginx

```bash
# 创建 Nginx 配置文件
sudo nano /etc/nginx/sites-available/chat-platform
```

添加以下配置：

```nginx
upstream backend {
    server 127.0.0.1:8083;  # 用户服务
    server 127.0.0.1:8084;  # 聊天服务
    server 127.0.0.1:8085;  # 群组服务
}

upstream websocket {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后台管理静态文件
    location /admin {
        alias /path/to/admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/chat-platform /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置 HTTPS（推荐）

#### 4.1 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 4.2 获取 SSL 证书

```bash
# 自动配置 HTTPS
sudo certbot --nginx -d your-domain.com
```

Certbot 会自动：
- 获取 SSL 证书
- 配置 Nginx
- 设置自动续期

#### 4.3 验证 HTTPS

访问 `https://your-domain.com`，应该能看到 SSL 证书信息。

### 5. 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

### 6. 设置自动备份

#### 6.1 数据库备份脚本

创建备份脚本：

```bash
#!/bin/bash
# /path/to/backup.sh

BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="chat_platform"
DB_USER="chat_user"
DB_PASS="your_mysql_password"

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

设置执行权限：

```bash
chmod +x /path/to/backup.sh
```

#### 6.2 配置定时任务

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每天凌晨2点执行备份）
0 2 * * * /path/to/backup.sh >> /var/log/mysql-backup.log 2>&1
```

---

## 云平台部署

### 1. Docker 部署

#### 1.1 构建镜像

```bash
# 构建所有镜像
docker-compose build

# 推送到 Docker Hub
docker tag microservice-project/frontend:latest your-dockerhub-username/frontend:latest
docker push your-dockerhub-username/frontend:latest
```

#### 1.2 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 更新服务
docker-compose pull
docker-compose up -d
```

### 2. Kubernetes 部署

#### 2.1 创建 Kubernetes 配置

**部署文件：** `k8s/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: your-registry/user-service:latest
        ports:
        - containerPort: 8083
        env:
        - name: MYSQL_HOST
          value: "mysql-service"
        - name: REDIS_URL
          value: "redis-service"
```

**服务文件：** `k8s/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8083
  type: LoadBalancer
```

#### 2.2 部署到 Kubernetes

```bash
# 部署应用
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 查看状态
kubectl get pods
kubectl get services

# 查看日志
kubectl logs -f deployment/user-service
```

### 3. 云服务商部署

#### 3.1 阿里云 ECS

1. 创建 ECS 实例
2. 安装 Docker
3. 上传代码
4. 使用 Docker Compose 部署

#### 3.2 腾讯云 CVM

1. 创建 CVM 实例
2. 安装 Docker
3. 上传代码
4. 使用 Docker Compose 部署

#### 3.3 AWS EC2

1. 创建 EC2 实例
2. 安装 Docker
3. 上传代码
4. 使用 Docker Compose 部署

---

## 故障排查

### 常见问题

#### 1. 服务无法启动

**检查日志：**

```bash
# PM2 日志
pm2 logs user-service

# Docker 日志
docker-compose logs user-service

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

**检查端口占用：**

```bash
# 检查端口是否被占用
netstat -tuln | grep 8083
```

**检查环境变量：**

```bash
# 检查 .env 文件
cat .env
```

#### 2. 数据库连接失败

**检查 MySQL 服务：**

```bash
sudo systemctl status mysql
```

**检查连接：**

```bash
mysql -u chat_user -p -h localhost chat_platform
```

**检查防火墙：**

```bash
sudo ufw status
```

#### 3. WebSocket 连接失败

**检查 WebSocket 服务：**

```bash
pm2 logs websocket-service
```

**检查 Nginx 配置：**

```bash
sudo nginx -t
```

**检查防火墙：**

```bash
sudo ufw allow 3001/tcp
```

#### 4. 文件上传失败

**检查 MinIO 服务：**

```bash
sudo systemctl status minio
```

**检查 MinIO 存储桶：**

```bash
# 使用 MinIO 客户端检查
mc ls local/chat-platform
```

**检查磁盘空间：**

```bash
df -h
```

### 日志查看

#### 应用日志

```bash
# PM2 日志
pm2 logs --lines 100

# Docker 日志
docker-compose logs --tail=100

# 系统日志
sudo journalctl -u nginx -n 100
```

#### 性能监控

```bash
# PM2 监控
pm2 monit

# 系统资源
htop
```

---

## 🔧 维护操作

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart all

# 或者使用 Docker
docker-compose down
docker-compose pull
docker-compose up -d
```

### 数据库维护

```bash
# 备份数据库
mysqldump -u chat_user -p chat_platform > backup.sql

# 恢复数据库
mysql -u chat_user -p chat_platform < backup.sql

# 优化数据库
mysql -u chat_user -p chat_platform -e "OPTIMIZE TABLE messages;"
```

### 清理日志

```bash
# 清理 PM2 日志
pm2 flush

# 清理 Docker 日志
docker system prune -a

# 清理 Nginx 日志
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log
```

---

## 📊 监控和告警

### 应用监控

使用 PM2 监控：

```bash
pm2 monit
```

### 系统监控

安装监控工具：

```bash
# 安装 htop
sudo apt-get install htop

# 安装 iotop
sudo apt-get install iotop

# 安装 nethogs
sudo apt-get install nethogs
```

### 日志监控

使用 ELK Stack 或其他日志收集工具。

---

## 🔒 安全加固

### 1. 系统安全

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 配置防火墙
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
```

### 2. 应用安全

- 定期更新依赖包
- 使用强密码
- 启用 HTTPS
- 配置 CORS
- 实施 API 速率限制

### 3. 数据安全

- 定期备份数据
- 加密敏感数据
- 限制数据库访问权限
- 实施审计日志

---

## 📞 技术支持

如果遇到部署问题，请：

1. 查看 [故障排查](#故障排查) 部分
2. 检查应用日志
3. 查看 GitHub Issues
4. 联系技术支持

---

## 📚 相关文档

- [README.md](./README.md) - 项目说明
- [开发指南](./docs/DEVELOPMENT.md) - 开发文档
- [API 文档](./docs/API.md) - API 接口文档

---

**最后更新**: 2024-01-01