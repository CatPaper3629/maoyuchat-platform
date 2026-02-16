# 快速启动指南

本文档提供聊天平台的快速启动指南，帮助你在几分钟内完成系统搭建和启动。

## 🚀 5分钟快速启动

### 前置条件

- Docker 和 Docker Compose 已安装
- 有足够的磁盘空间（至少 5GB）

### 快速启动步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd microservice_project
```

#### 2. 配置环境变量

```bash
cp .env.example .env
```

#### 3. 启动服务

```bash
docker-compose up -d
```

#### 4. 访问应用

- **前端**: http://localhost:3000
- **后台管理**: http://localhost:3002
- **MinIO 控制台**: http://localhost:9001

#### 5. 停止服务

```bash
docker-compose down
```

---

## 📱 功能使用指南

### 用户端使用

#### 1. 注册账号

1. 访问 http://localhost:3000
2. 点击"注册"按钮
3. 填写用户名、密码、邮箱
4. 点击"注册"完成

#### 2. 登录系统

1. 访问 http://localhost:3000
2. 输入用户名和密码
3. 点击"登录"

#### 3. 发送消息

1. 在会话列表中选择一个会话
2. 在输入框中输入消息
3. 按回车键或点击发送按钮

#### 4. 发送图片

1. 点击图片上传按钮
2. 选择图片文件
3. 点击发送

#### 5. 发送语音

1. 按住语音录制按钮
2. 开始说话
3. 松开按钮发送

#### 6. 创建群组

1. 点击"新建群组"
2. 输入群组名称
3. 选择要邀请的成员
4. 点击"创建"

### 管理端使用

#### 1. 登录后台

1. 访问 http://localhost:3002
2. 输入管理员账号和密码
3. 点击"登录"

#### 2. 查看用户列表

1. 点击"用户管理"
2. 查看用户列表
3. 可以搜索、筛选用户

#### 3. 封禁用户

1. 在用户列表中找到目标用户
2. 点击"封禁"按钮
3. 输入封禁原因
4. 确认封禁

#### 4. 查看系统监控

1. 点击"系统监控"
2. 查看系统资源使用情况
3. 查看在线用户数

---

## 🔧 常用命令

### Docker Compose 命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 重新构建并启动
docker-compose up -d --build
```

### PM2 命令

```bash
# 查看所有服务
pm2 list

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 查看监控
pm2 monit
```

### Nginx 命令

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 系统架构图

```
┌─────────────────────────────────────┐
│           用户浏览器                    │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           Nginx (反向代理)            │
│         端口: 80 / 443              │
└─────────────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        ↓                   ↓
┌──────────────┐    ┌──────────────┐
│  前端应用     │    │  后台管理     │
│  端口: 3000  │    │  端口: 3002  │
└──────────────┘    └──────────────┘
        ↓                   ↓
┌─────────────────────────────────────┐
│        API 网关 (Nginx)             │
│         端口: 8080                 │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      WebSocket 服务                  │
│         端口: 3001                  │
└─────────────────────────────────────┘
                  ↓
    ┌───────────┬───────────┬───────────┐
    ↓           ↓           ↓           ↓
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│MySQL  │  │ Redis  │  │ MinIO  │  │微服务  │
│:3306  │  │ :6379  │  │ :9000  │  │8083-5  │
└────────┘  └────────┘  └────────┘  └────────┘
```

---

## 🔑 默认账号

### 前端账号

- **用户名**: demo
- **密码**: demo123

### 后台管理账号

- **用户名**: admin
- **密码**: admin123

### MinIO 账号

- **Access Key**: minioadmin
- **Secret Key**: minioadmin123

---

## 📞 常见问题

### Q: 服务无法启动？

**A:** 检查端口是否被占用：

```bash
# 检查端口占用
netstat -tuln | grep -E '3000|3001|3002|8083|8084|8085'
```

### Q: 无法连接数据库？

**A:** 检查数据库服务状态：

```bash
# 检查 MySQL
sudo systemctl status mysql

# 检查 Redis
sudo systemctl status redis
```

### Q: 文件上传失败？

**A:** 检查 MinIO 服务：

```bash
# 检查 MinIO
sudo systemctl status minio

# 检查存储空间
df -h
```

### Q: WebSocket 连接失败？

**A:** 检查 WebSocket 服务：

```bash
# 检查服务状态
pm2 logs websocket-service

# 检查防火墙
sudo ufw allow 3001/tcp
```

---

## 🎯 下一步

- 查看 [完整文档](./README.md)
- 阅读 [部署指南](./DEPLOYMENT.md)
- 查看开发文档 [开发指南](./DEVELOPMENT.md)

---

**祝你使用愉快！** 🎉