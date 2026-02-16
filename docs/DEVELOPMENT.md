# 开发指南

本文档提供网页聊天平台的详细开发指南。

## 目录

- [开发环境搭建](#开发环境搭建)
- [前端开发](#前端开发)
- [后端开发](#后端开发)
- [数据库操作](#数据库操作)
- [API 开发规范](#api-开发规范)
- [测试指南](#测试指南)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

## 开发环境搭建

### 必需软件

- Node.js 18+ / 20+
- MySQL 8.0+
- Redis 7+
- Git
- Docker & Docker Compose（推荐）

### 推荐工具

- VS Code / WebStorm
- Postman / Apifox
- Redis Desktop Manager
- Navicat / DBeaver
- Docker Desktop

### 环境变量配置

1. 复制 `.env.example` 为 `.env`
2. 根据实际情况修改配置
3. 确保所有服务可访问

## 前端开发

### 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- Axios

### 项目结构

```
frontend/src/
├── assets/        # 静态资源
├── components/    # 通用组件
├── router/        # 路由配置
├── stores/        # 状态管理
├── types/         # TypeScript 类型
├── utils/         # 工具函数
├── views/         # 页面组件
└── main.ts        # 入口文件
```

### 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

### 组件开发规范

1. **命名规范**
   - 组件文件：PascalCase（如 `UserProfile.vue`）
   - 组件名：PascalCase（如 `<UserProfile />`）
   - 事件名：kebab-case（如 `@user-login`）

2. **代码风格**
   - 使用 TypeScript
   - 使用 Composition API
   - 组件必须包含 `<script setup>`

3. **示例组件**

```vue
<template>
  <div class="user-profile">
    <el-avatar :size="size" :src="avatarUrl">
      {{ nickname?.[0] || 'U' }}
    </el-avatar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  userId: number;
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
});

const { data: user } = useUserQuery(props.userId);

const avatarUrl = computed(() => user.value?.avatarUrl);
const nickname = computed(() => user.value?.nickname);
</script>

<style scoped>
.user-profile {
  display: inline-flex;
  align-items: center;
}
</style>
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null);

  const login = async (username: string, password: string) => {
    // 登录逻辑
  };

  const logout = () => {
    currentUser.value = null;
  };

  return {
    currentUser,
    login,
    logout,
  };
});
```

### API 调用

统一使用 axios 进行 API 调用：

```typescript
// api/user.ts
import api from './index';

export const getCurrentUser = () => {
  return api.get<User>('/user/current');
};
```

## 后端开发

### 技术栈

- Node.js
- Express / Koa
- WebSocket
- MySQL2
- Redis
- JWT

### 项目结构

```
services/user/src/
├── config/        # 配置文件
├── controllers/   # 控制器
├── models/        # 数据模型
├── routes/        # 路由
├── services/      # 业务逻辑
├── middleware/    # 中间件
├── utils/         # 工具函数
└── index.js       # 入口文件
```

### 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动生产服务器
npm start

# 运行测试
npm test
```

### WebSocket 服务开发

WebSocket 服务负责实时通信：

```javascript
// websocket/src/index.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // 处理消息
  });

  ws.on('close', () => {
    // 清理连接
  });
});
```

## 数据库操作

### 连接配置

```javascript
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
```

### 查询示例

```javascript
// 查询单条
const [user] = await pool.execute(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// 查询多条
const users = await pool.execute(
  'SELECT * FROM users WHERE status = ?',
  ['online']
);

// 插入
const [result] = await pool.execute(
  'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
  [senderId, receiverId, content]
);

// 更新
await pool.execute(
  'UPDATE users SET status = ? WHERE id = ?',
  [status, userId]
);
```

### Redis 操作

```javascript
// 设置键值
await redisClient.set('user:123:status', 'online');

// 获取值
const status = await redisClient.get('user:123:status');

// 设置过期时间
await redisClient.expire('user:123:status', 300);

// 删除键
await redisClient.del('user:123:status');
```

## API 开发规范

### RESTful API 设计

```
GET    /api/users          # 获取用户列表
GET    /api/users/:id      # 获取单个用户
POST   /api/users          # 创建用户
PUT    /api/users/:id      # 更新用户
DELETE /api/users/:id      # 删除用户
```

### 响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  }
}
```

### 错误处理

```javascript
try {
  const result = await someOperation();
  res.json({ code: 200, data: result });
} catch (error) {
  res.status(500).json({
    code: 500,
    message: error.message,
  });
}
```

## 测试指南

### 前端测试

```bash
# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test:e2e

# 生成覆盖率报告
npm run test:coverage
```

### 后端测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test user.test.js

# 监视模式
npm run test:watch
```

## 调试技巧

### 前端调试

1. 使用 Vue DevTools
2. 控制台日志
3. Network 面板查看请求
4. Source Map 定位问题

### 后端调试

1. 使用 console.log 调试
2. 使用调试器断点
3. 查看 Redis 数据
4. 检查 MySQL 慢查询

### WebSocket 调试

1. 使用 wscat 工具
2. 浏览器控制台
3. 查看连接状态
4. 监听消息事件

## 常见问题

### 端口被占用

```bash
# 查找占用端口的进程
netstat -ano | findstr :3000

# 杀死进程
taskkill /PID <pid> /F
```

### 连接数据库失败

1. 检查数据库服务是否启动
2. 验证连接配置
3. 检查防火墙设置
4. 确认数据库权限

### WebSocket 连接断开

1. 检查网络连接
2. 验证 Token 有效性
3. 查看服务器日志
4. 检查心跳机制

### 构建失败

1. 清除缓存：`rm -rf node_modules dist`
2. 重新安装依赖：`npm install`
3. 检查 TypeScript 类型错误
4. 查看构建日志

## 性能优化

### 前端优化

- 代码分割
- 懒加载
- 图片压缩
- CDN 加速
- 缓存策略

### 后端优化

- 连接池
- 缓存策略
- 异步处理
- 查询优化
- 索引优化

## 安全建议

1. 永远不要在代码中硬编码敏感信息
2. 使用环境变量存储配置
3. 定期更新依赖包
4. 实施输入验证
5. 使用 HTTPS
6. 启用 CORS
7. 限制请求频率

## 更多资源

- [Vue.js 文档](https://vuejs.org/)
- [Node.js 文档](https://nodejs.org/)
- [MySQL 文档](https://dev.mysql.com/doc/)
- [Redis 文档](https://redis.io/documentation)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)