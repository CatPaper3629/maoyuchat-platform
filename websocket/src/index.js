require('dotenv').config();
const WebSocket = require('ws');
const redis = require('redis');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

// 配置
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Redis 客户端
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// MySQL 连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'chat_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// WebSocket 服务器
const wss = new WebSocket.Server({ port: PORT });

// 存储在线用户连接
const clients = new Map();

// 离线消息队列
const offlineMessages = new Map();

// 初始化 Redis
async function initRedis() {
  try {
    await redisClient.connect();
    console.log('Redis 连接成功');
  } catch (error) {
    console.error('Redis 连接失败:', error);
    process.exit(1);
  }
}

// 初始化 MySQL
async function initMySQL() {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL 连接成功');
    connection.release();
  } catch (error) {
    console.error('MySQL 连接失败:', error);
    process.exit(1);
  }
}

// 验证 JWT Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 更新用户在线状态
async function updateUserOnlineStatus(userId, status) {
  try {
    const redisKey = `user:${userId}:status`;
    await redisClient.set(redisKey, status);
    await redisClient.expire(redisKey, 300); // 5分钟过期

    // 更新数据库
    await pool.execute(
      'UPDATE users SET status = ?, last_online_at = NOW() WHERE id = ?',
      [status, userId]
    );

    console.log(`用户 ${userId} 状态更新为: ${status}`);
  } catch (error) {
    console.error('更新用户状态失败:', error);
  }
}

// 检查用户是否在线
async function isUserOnline(userId) {
  try {
    const redisKey = `user:${userId}:status`;
    const status = await redisClient.get(redisKey);
    return status === 'online';
  } catch (error) {
    console.error('检查用户在线状态失败:', error);
    return false;
  }
}

// 存储离线消息
async function storeOfflineMessage(messageData) {
  try {
    const userId = messageData.receiverId;
    const redisKey = `offline:messages:${userId}`;
    
    // 存储到 Redis 列表
    await redisClient.lPush(redisKey, JSON.stringify(messageData));
    await redisClient.expire(redisKey, 7 * 24 * 60 * 60); // 7天过期

    console.log(`存储离线消息，接收者: ${userId}`);
  } catch (error) {
    console.error('存储离线消息失败:', error);
  }
}

// 获取并清空离线消息
async function getOfflineMessages(userId) {
  try {
    const redisKey = `offline:messages:${userId}`;
    const messages = [];
    
    // 获取所有离线消息
    while (true) {
      const message = await redisClient.rPop(redisKey);
      if (!message) break;
      messages.push(JSON.parse(message));
    }

    console.log(`用户 ${userId} 有 ${messages.length} 条离线消息`);
    return messages;
  } catch (error) {
    console.error('获取离线消息失败:', error);
    return [];
  }
}

// 发送消息到特定用户
async function sendToUser(userId, message) {
  const client = clients.get(userId);
  
  if (client && client.readyState === WebSocket.OPEN) {
    // 用户在线，直接发送
    client.send(JSON.stringify(message));
  } else {
    // 用户离线，存储离线消息
    if (message.type === 'message') {
      await storeOfflineMessage(message.data);
    }
  }
}

// 广播消息到所有连接
function broadcast(message, excludeUserId = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (!excludeUserId || client.userId !== excludeUserId) {
        client.send(JSON.stringify(message));
      }
    }
  });
}

// 处理心跳
function handleHeartbeat(ws) {
  ws.isAlive = true;
}

// WebSocket 连接处理
wss.on('connection', async (ws, req) => {
  console.log('新的 WebSocket 连接');

  // 获取 token
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(1008, '缺少认证令牌');
    return;
  }

  // 验证 token
  const decoded = verifyToken(token);
  if (!decoded) {
    ws.close(1008, '无效的认证令牌');
    return;
  }

  const userId = decoded.userId;
  ws.userId = userId;
  ws.isAlive = true;

  // 存储连接
  clients.set(userId, ws);

  // 更新用户在线状态
  await updateUserOnlineStatus(userId, 'online');

  // 发送欢迎消息
  ws.send(JSON.stringify({
    type: 'connected',
    data: { userId, message: '连接成功' },
    timestamp: new Date().toISOString(),
  }));

  // 推送离线消息
  const offlineMsgs = await getOfflineMessages(userId);
  if (offlineMsgs.length > 0) {
    ws.send(JSON.stringify({
      type: 'offline_messages',
      data: {
        count: offlineMsgs.length,
        messages: offlineMsgs,
      },
      timestamp: new Date().toISOString(),
    }));
  }

  // 心跳检测
  ws.on('pong', () => handleHeartbeat(ws));

  // 处理消息
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString(),
          }));
          break;

        case 'message':
          // 转发消息到目标用户
          if (data.receiverType === 'user') {
            await sendToUser(data.receiverId, {
              type: 'message',
              data: data,
              timestamp: new Date().toISOString(),
            });
          } else if (data.receiverType === 'group') {
            // 群组消息广播
            broadcast({
              type: 'message',
              data: data,
              timestamp: new Date().toISOString(),
            });
          }

          // 发送消息确认
          ws.send(JSON.stringify({
            type: 'message_sent',
            data: {
              messageId: data.id,
              status: 'sent',
            },
            timestamp: new Date().toISOString(),
          }));
          break;

        case 'message_read':
          // 消息已读确认
          const { messageId, senderId } = data;
          if (senderId) {
            sendToUser(senderId, {
              type: 'message_read',
              data: { messageId },
              timestamp: new Date().toISOString(),
            });
          }
          break;

        case 'typing':
          // 输入状态通知
          if (data.receiverType === 'user') {
            await sendToUser(data.receiverId, {
              type: 'typing',
              data: { userId, isTyping: data.isTyping },
              timestamp: new Date().toISOString(),
            });
          }
          break;

        case 'status':
          // 更新用户状态
          await updateUserOnlineStatus(userId, data.status || 'online');
          break;

        default:
          console.log('未知消息类型:', data.type);
      }
    } catch (error) {
      console.error('处理消息失败:', error);
    }
  });

  // 连接关闭
  ws.on('close', async () => {
    console.log(`用户 ${userId} 断开连接`);
    clients.delete(userId);
    await updateUserOnlineStatus(userId, 'offline');
  });

  // 连接错误
  ws.on('error', (error) => {
    console.error('WebSocket 错误:', error);
  });
});

// 心跳检测间隔
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      ws.terminate();
      return;
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// 优雅关闭
wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// 启动服务器
async function start() {
  await initRedis();
  await initMySQL();

  console.log(`WebSocket 服务器运行在端口 ${PORT}`);
}

start().catch((error) => {
  console.error('启动失败:', error);
  process.exit(1);
});