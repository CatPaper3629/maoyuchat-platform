# 💬 MaoyuChat Platform - 网页聊天系统

一个功能完整的现代化网页聊天平台，采用微服务架构，支持实时消息、群组聊天、多媒体消息、文件传输等功能。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node.js-18%2B-green.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/vue-3.4%2B-42b883.svg)](https://vuejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)

---

## 📋 项目简介

本项目是一个基于微服务架构的网页聊天平台，采用前后端分离设计，支持实时通信、多端同步、消息推送、多媒体消息等丰富功能。项目已经过完整的开发和测试，可以直接用于生产环境。

### ✨ 核心特性

- 🚀 **高性能微服务架构**：基于 Node.js 的微服务设计，易于扩展
- 💬 **实时消息通信**：WebSocket 实时双向通信，支持即时消息
- 📱 **响应式设计**：完美适配 PC、平板、手机等多端
- 🎨 **现代化 UI**：基于 Element Plus 的企业级界面设计
- 🔒 **安全可靠**：JWT 认证、数据加密、权限控制
- 📊 **后台管理**：完整的后台管理系统，支持数据统计和系统监控
- 🎯 **多媒体支持**：图片、语音、视频、文件等多种消息类型
- 🔄 **离线消息**：支持离线消息存储和推送

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────┐
│                  客户端层                        │
│  Web (Vue 3) / Mobile (Responsive Design)     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              接入层 / 网关层                     │
│    Nginx + OpenResty (负载均衡、反向代理)      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              WebSocket 接入层                     │
│   Node.js + Socket.io (实时消息处理)            │
└─────────────────────────────────────────────────┘
                      ↓
┌──────────────┬──────────────┬──────────────┐
│   用户服务   │   聊天服务   │   群组服务   │
│  (端口:8083) │  (端口:8084) │  (端口:8085) │
└──────────────┴──────────────┴──────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                  存储层                          │
│  MySQL 8.0 (数据库)  +  Redis 7 (缓存)       │
│  + MinIO (文件存储)                             │
└─────────────────────────────────────────────────┘
```

---

## 🎯 功能列表

### 📱 用户功能

#### 基础功能
- ✅ 用户注册（用户名+密码、手机号）
- ✅ 用户登录（JWT 认证）
- ✅ 个人资料管理（头像、昵称、个性签名）
- ✅ 状态设置（在线/离线/忙碌）
- ✅ 密码修改
- ✅ 登出功能

#### 消息功能
- ✅ 一对一聊天
- ✅ 群组聊天
- ✅ 多媒体消息：
  - 📸 图片消息（上传、预览、查看）
  - 🎤 语音消息（录制、播放、波形显示）
  - 🎬 视频消息（上传、预览、播放）
  - 📎 文件传输（上传、下载、类型识别）
- ✅ 消息状态（已发送、已送达、已读）
- ✅ 消息撤回（2分钟内）
- ✅ 消息引用回复
- ✅ @功能（@特定成员）
- ✅ 输入状态指示
- ✅ 消息搜索
- ✅ 离线消息推送

#### 好友功能
- ✅ 添加好友（搜索用户名）
- ✅ 删除好友
- ✅ 好友列表
- ✅ 好友分组
- ✅ 修改备注
- ✅ 黑名单管理
- ✅ 在线状态显示

#### 群组功能
- ✅ 创建群组
- ✅ 加入群组
- ✅ 退出群组
- ✅ 邀请成员
- ✅ 移除成员
- ✅ 群组设置
  - 群名称、头像
  - 群公告
  - 最大成员数
  - 入群设置
- ✅ 权限管理
  - 群主权限
  - 管理员权限
  - 普通成员权限
- ✅ 成员禁言
- ✅ 转让群主
- ✅ 解散群组

#### 会话功能
- ✅ 会话列表（最近聊天）
- ✅ 会话置顶
- ✅ 会话免打扰
- ✅ 清空聊天记录
- ✅ 会话搜索
- ✅ 未读消息计数

### 🔧 后台管理功能

#### 用户管理
- ✅ 用户列表（分页、搜索、筛选）
- ✅ 用户详情查看
- ✅ 用户信息编辑
- ✅ 用户封禁/解封
- ✅ 用户删除
- ✅ 用户统计

#### 内容管理
- ✅ 消息内容监控
- ✅ 敏感词过滤
- ✅ 举报处理
- ✅ 内容审核
- ✅ 违规内容删除

#### 系统监控
- ✅ 系统概览（CPU、内存、磁盘）
- ✅ 在线用户监控
- ✅ 实时数据更新
- ✅ 资源使用率图表
- ✅ 服务状态监控

#### 数据统计
- ✅ 用户活跃度统计
- ✅ 消息量统计
- ✅ 群组统计
- ✅ 数据可视化图表
- ✅ 趋势分析

#### 系统设置
- ✅ 管理员权限管理
- ✅ 系统参数配置
- ✅ 服务器配置
- ✅ 数据备份恢复
- ✅ 日志管理

---

## 🛠️ 技术栈

### 前端技术
- **框架**: Vue 3.4 + TypeScript 5.3
- **构建工具**: Vite 5.0
- **UI 组件库**: Element Plus 2.5
- **状态管理**: Pinia 2.1
- **路由**: Vue Router 4.2
- **实时通信**: Socket.io-client
- **HTTP 客户端**: Axios 1.6
- **图表库**: ECharts 5.5
- **日期处理**: Day.js 1.11

### 后端技术
- **运行时**: Node.js 18+
- **框架**: Express.js
- **实时通信**: Socket.io 4.x
- **数据库**: MySQL 8.0
- **缓存**: Redis 7
- **文件存储**: MinIO
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **API 文档**: Swagger

### 基础设施
- **容器化**: Docker + Docker Compose
- **负载均衡**: Nginx + OpenResty
- **进程管理**: PM2
- **反向代理**: Nginx
- **CI/CD**: GitHub Actions（可选）

---

## 📁 项目结构

```
microservice_project/
├── frontend/                    # 前端项目（Vue 3）
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   │   ├── Login.vue       # 登录页
│   │   │   ├── Register.vue    # 注册页
│   │   │   ├── Chat.vue        # 聊天主页
│   │   │   └── Profile.vue     # 个人资料页
│   │   ├── components/         # 通用组件
│   │   │   ├── ImageUpload.vue # 图片上传
│   │   │   ├── VoiceRecorder.vue # 语音录制
│   │   │   ├── VideoMessage.vue # 视频消息
│   │   │   ├── FileMessage.vue # 文件消息
│   │   │   ├── SearchBox.vue   # 搜索框
│   │   │   └── GroupManagement.vue # 群组管理
│   │   ├── stores/             # 状态管理
│   │   │   ├── user.ts         # 用户状态
│   │   │   └── chat.ts         # 聊天状态
│   │   ├── router/             # 路由配置
│   │   ├── api/                # API 接口
│   │   │   ├── index.ts        # Axios 配置
│   │   │   ├── user.ts         # 用户 API
│   │   │   ├── message.ts      # 消息 API
│   │   │   ├── friend.ts       # 好友 API
│   │   │   ├── group.ts        # 群组 API
│   │   │   └── search.ts       # 搜索 API
│   │   ├── utils/              # 工具函数
│   │   │   └── websocket.ts    # WebSocket 服务
│   │   ├── types/              # TypeScript 类型
│   │   └── assets/             # 静态资源
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── admin/                       # 后台管理系统
│   ├── src/
│   │   ├── views/              # 页面组件
│   │   │   ├── Login.vue       # 登录页
│   │   │   ├── dashboard/      # 仪表盘
│   │   │   ├── users/          # 用户管理
│   │   │   ├── content/        # 内容管理
│   │   │   ├── system/         # 系统监控
│   │   │   └── settings/       # 系统设置
│   │   ├── api/                # API 接口
│   │   ├── stores/             # 状态管理
│   │   └── layout/             # 布局组件
│   ├── package.json
│   └── vite.config.ts
│
├── services/                    # 微服务
│   ├── user/                    # 用户服务（端口 8083）
│   │   ├── src/
│   │   │   ├── config/          # 配置
│   │   │   ├── controllers/     # 控制器
│   │   │   ├── routes/          # 路由
│   │   │   ├── middleware/      # 中间件
│   │   │   └── __tests__/       # 测试
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── chat/                    # 聊天服务（端口 8084）
│   │   ├── src/
│   │   │   ├── config/          # 配置
│   │   │   ├── controllers/     # 控制器
│   │   │   ├── routes/          # 路由
│   │   │   └── middleware/      # 中间件
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── group/                   # 群组服务（端口 8085）
│       ├── src/
│       │   ├── config/          # 配置
│       │   ├── controllers/     # 控制器
│       │   ├── routes/          # 路由
│       │   └── middleware/      # 中间件
│       ├── package.json
│       └── Dockerfile
│
├── websocket/                   # WebSocket 服务（端口 3001）
│   ├── src/
│   │   └── index.js
│   └── package.json
│
├── gateway/                     # Nginx 网关配置
│   └── nginx.conf
│
├── database/                    # 数据库
│   ├── mysql/
│   │   └── init.sql            # 数据库初始化脚本
│   └── redis/
│
├── storage/                     # 文件存储
│   └── minio/
│
├── docs/                        # 文档
│   ├── DEVELOPMENT.md          # 开发指南
│   ├── PHASE2_COMPLETED.md     # 第二阶段完成报告
│   ├── PHASE3_COMPLETED.md     # 第三阶段完成报告
│   └── PHASE4_COMPLETED.md     # 第四阶段完成报告
│
├── docker-compose.yml          # Docker 编排文件
├── .env.example                # 环境变量示例
├── .gitignore                  # Git 忽略配置
└── README.md                   # 项目说明
```

---

## 🚀 快速开始

### 前置要求

- **Node.js**: 18.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **Redis**: 7.0 或更高版本
- **Docker**: 20.10+（可选，用于容器化部署）
- **Docker Compose**: 2.0+（可选）

### 安装步骤

#### 方式一：Docker Compose 部署（推荐）

这是最简单快捷的部署方式，适合快速启动和测试。

```bash
# 1. 克隆项目
git clone <repository-url>
cd microservice_project

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置必要的参数

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f

# 6. 停止服务
docker-compose down
```

**访问地址：**
- 前端应用: http://localhost:3000
- 后台管理: http://localhost:3002
- WebSocket: ws://localhost:3001
- MinIO 控制台: http://localhost:9001（minioadmin/minioadmin）

#### 方式二：本地开发部署

适用于开发环境，可以实时查看代码修改效果。

**1. 启动数据库服务**

```bash
# 使用 Docker 启动 MySQL 和 Redis
docker-compose up -d mysql redis minio
```

**2. 初始化数据库**

```bash
# 连接到 MySQL 并执行初始化脚本
mysql -h localhost -u root -p < database/mysql/init.sql
```

**3. 启动后端服务**

```bash
# 启动 WebSocket 服务
cd websocket
npm install
npm run dev

# 启动用户服务（新终端）
cd services/user
npm install
npm run dev

# 启动聊天服务（新终端）
cd services/chat
npm install
npm run dev

# 启动群组服务（新终端）
cd services/group
npm install
npm run dev
```

**4. 启动前端应用**

```bash
# 启动前端
cd frontend
npm install
npm run dev

# 启动后台管理（新终端）
cd admin
npm install
npm run dev
```

**5. 访问应用**

- 前端应用: http://localhost:5173
- 后台管理: http://localhost:3002

### 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# ====== 数据库配置 ======
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_USER=maoyuchat_user
MYSQL_PASSWORD=maoyuchat_password
MYSQL_DATABASE=maoyuchat_platform

# ====== Redis 配置 ======
REDIS_URL=redis://redis:6379

# ====== JWT 密钥 ======
JWT_SECRET=your-secret-key-change-in-production

# ====== MinIO 配置 ======
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=maoyuchat-platform

# ====== 服务端口 ======
USER_SERVICE_PORT=8083
CHAT_SERVICE_PORT=8084
GROUP_SERVICE_PORT=8085
WEBSOCKET_PORT=3001

# ====== 前端配置 ======
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:3001
```

---

## 📊 数据库设计

### 核心表结构

#### 1. 用户表 (users)
```sql
- id: 用户ID（主键）
- username: 用户名（唯一）
- password_hash: 密码哈希
- email: 邮箱
- phone: 手机号
- avatar_url: 头像URL
- status: 状态（online/offline/away）
- created_at: 创建时间
- updated_at: 更新时间
```

#### 2. 好友关系表 (friendships)
```sql
- id: 关系ID（主键）
- user_id: 用户ID
- friend_id: 好友ID
- remark_name: 备注名称
- group_id: 分组ID
- created_at: 创建时间
```

#### 3. 群组表 (groups)
```sql
- id: 群组ID（主键）
- name: 群组名称
- avatar_url: 头像URL
- owner_id: 群主ID
- announcement: 群公告
- max_members: 最大成员数
- created_at: 创建时间
```

#### 4. 群成员表 (group_members)
```sql
- id: 成员ID（主键）
- group_id: 群组ID
- user_id: 用户ID
- role: 角色（owner/admin/member）
- joined_at: 加入时间
```

#### 5. 消息表 (messages)
```sql
- id: 消息ID（主键）
- sender_id: 发送者ID
- receiver_type: 接收者类型（user/group）
- receiver_id: 接收者ID
- content_type: 内容类型（text/image/voice/video/file）
- content: 消息内容
- status: 状态（sent/delivered/read）
- reply_to_id: 回复的消息ID
- created_at: 创建时间
```

#### 6. 文件表 (files)
```sql
- id: 文件ID（主键）
- filename: 文件名
- file_type: 文件类型
- file_size: 文件大小
- storage_path: 存储路径
- access_url: 访问URL
- uploader_id: 上传者ID
- created_at: 创建时间
```

详细的数据库设计请参考 `database/mysql/init.sql`。

---

## 🔌 API 接口文档

### 基础信息

- **Base URL**: `http://localhost:8080/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

### 认证接口

#### 用户注册
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "username": "testuser",
  "password": "Test123456",
  "email": "test@example.com",
  "phone": "13800138000"
}

Response:
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

#### 用户登录
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "username": "testuser",
  "password": "Test123456"
}

Response:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

### 消息接口

#### 获取会话列表
```
GET /api/conversations
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "data": {
    "conversations": [
      {
        "id": 1,
        "receiverType": "user",
        "receiverId": 2,
        "name": "张三",
        "avatar": "avatar_url",
        "lastMessage": { ... },
        "unreadCount": 5,
        "isPinned": false,
        "isMuted": false,
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 获取消息历史
```
GET /api/messages?receiverType=user&receiverId=2&page=1&pageSize=50
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "data": {
    "messages": [
      {
        "id": 1,
        "senderId": 1,
        "senderName": "我",
        "senderAvatar": "avatar_url",
        "receiverType": "user",
        "receiverId": 2,
        "contentType": "text",
        "content": "你好",
        "status": "read",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100
  }
}
```

#### 发送消息
```
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "receiverType": "user",
  "receiverId": 2,
  "contentType": "text",
  "content": "你好",
  "replyToId": null
}

Response:
{
  "code": 200,
  "message": "消息发送成功",
  "data": {
    "id": 1,
    "senderId": 1,
    "receiverType": "user",
    "receiverId": 2,
    "contentType": "text",
    "content": "你好",
    "status": "sent",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 文件接口

#### 上传文件
```
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Body:
- file: 文件数据
- fileType: 文件类型（image/voice/video/file）

Response:
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "fileId": 1,
    "accessUrl": "https://example.com/file.jpg",
    "url": "https://example.com/file.jpg"
  }
}
```

### 好友接口

#### 添加好友
```
POST /api/friendship/add
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "userId": 2,
  "remarkName": "张三"
}
```

#### 获取好友列表
```
GET /api/friendship/list
Authorization: Bearer {token}
```

### 群组接口

#### 创建群组
```
POST /api/group/create
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "name": "测试群",
  "avatar": "avatar_url",
  "announcement": "群公告",
  "memberIds": [2, 3, 4]
}
```

#### 获取群组列表
```
GET /api/group/list
Authorization: Bearer {token}
```

---

## 🧪 测试

### 前端测试

```bash
cd frontend
npm install
npm run test

# 生成测试覆盖率报告
npm run test:coverage
```

### 后端测试

```bash
cd services/user
npm install
npm run test

# 使用 Makefile 运行所有测试
npm run test:all
```

### E2E 测试

```bash
npm run test:e2e
```

---

## 📦 部署

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据
docker-compose down -v
```

### 传统部署

#### 前端部署

```bash
cd frontend
npm run build

# 将 dist 目录部署到 Nginx
# 配置 Nginx 反向代理
```

#### 后端部署

```bash
# 使用 PM2 启动服务
pm2 start services/user/src/index.js --name user-service
pm2 start services/chat/src/index.js --name chat-service
pm2 start services/group/src/index.js --name group-service
pm2 start websocket/src/index.js --name websocket-service

# 保存 PM2 配置
pm2 save

# 开机自启
pm2 startup
```

### Nginx 配置

```nginx
upstream backend {
    server localhost:8083;  # 用户服务
    server localhost:8084;  # 聊天服务
    server localhost:8085;  # 群组服务
}

upstream websocket {
    server localhost:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket 代理
    location /socket.io/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🔧 配置说明

### 系统配置

#### 文件上传限制
```javascript
// 图片大小限制
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// 视频大小限制
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// 文件大小限制
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

#### 消息配置
```javascript
// 离线消息过期时间
const OFFLINE_MESSAGE_EXPIRE = 7 * 24 * 60 * 60; // 7天

// 消息撤回时间限制
const MESSAGE_REVOKE_TIME = 2 * 60; // 2分钟

// 最大群组成员数
const MAX_GROUP_MEMBERS = 500;
```

#### WebSocket 配置
```javascript
// 心跳检测间隔
const HEARTBEAT_INTERVAL = 30000; // 30秒

// 连接超时时间
const CONNECTION_TIMEOUT = 60000; // 60秒
```

---

## 🔒 安全建议

### 1. 认证安全
- ✅ 使用强密码策略（至少8位，包含大小写字母、数字、特殊字符）
- ✅ 定期更换 JWT 密钥
- ✅ 使用 HTTPS 加密传输
- ✅ 实现 Token 刷新机制

### 2. 数据安全
- ✅ 密码使用 bcrypt 加密存储
- ✅ 敏感数据加密传输
- ✅ 定期备份数据库
- ✅ 实施数据访问控制

### 3. 网络安全
- ✅ 配置防火墙规则
- ✅ 实施 API 速率限制
- ✅ 防止 SQL 注入
- ✅ 防止 XSS 攻击
- ✅ 防止 CSRF 攻击

### 4. 运维安全
- ✅ 启用访问日志
- ✅ 实施操作审计
- ✅ 定期更新依赖包
- ✅ 监控异常行为
- ✅ 实施入侵检测

---

## 📈 性能优化

### 前端优化
- ✅ 代码分割和懒加载
- ✅ 图片压缩和 CDN 加速
- ✅ 虚拟滚动（长列表）
- ✅ 防抖和节流
- ✅ 缓存策略

### 后端优化
- ✅ 数据库索引优化
- ✅ Redis 缓存热点数据
- ✅ 连接池管理
- ✅ 消息队列
- ✅ 负载均衡

### WebSocket 优化
- ✅ 心跳保活
- ✅ 连接复用
- ✅ 消息压缩
- ✅ 批量消息处理

---

## 📚 文档

- [开发指南](./docs/DEVELOPMENT.md) - 详细的开发文档
- [第二阶段完成报告](./docs/PHASE2_COMPLETED.md) - 核心功能开发报告
- [第三阶段完成报告](./docs/PHASE3_COMPLETED.md) - 功能完善报告
- [第四阶段完成报告](./docs/PHASE4_COMPLETED.md) - 后台管理报告

---

## 🤝 贡献指南

欢迎贡献代码、报告 Bug 或提出新功能建议！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 编写单元测试
- 添加必要的注释
- 更新相关文档

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- **项目主页**: [GitHub Repository](https://github.com/CatPaper3629/maoyuchat-platform)
- **问题反馈**: [Issues](https://github.com/CatPaper3629/maoyuchat-platform/issues)

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Socket.io](https://socket.io/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/)
- [MinIO](https://min.io/)

感谢所有贡献者和开源社区的支持！

---

## 📊 项目状态

- ✅ 第一阶段：基础架构搭建
- ✅ 第二阶段：核心功能开发
- ✅ 第三阶段：功能完善
- ✅ 第四阶段：后台管理
- ✅ 第五阶段：测试优化
- 🔄 第六阶段：部署上线

**当前版本**: v1.0.0

---

## 🎯 路线图

### v1.1.0 (规划中)
- [ ] 音视频通话（WebRTC）
- [ ] 屏幕共享
- [ ] 消息翻译
- [ ] 消息加密
- [ ] 多语言支持

### v2.0.0 (规划中)
- [ ] 移动端 App（React Native）
- [ ] 机器人接口（AI 集成）
- [ ] 第三方登录（微信、QQ、GitHub）
- [ ] 企业版功能
- [ ] 插件系统

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by MaoYu Team

</div>