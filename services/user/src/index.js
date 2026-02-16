require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const redisClient = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 8081;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  });
});

// 启动服务器
async function start() {
  try {
    // 连接 Redis
    await redisClient.connect();
    console.log('Redis 连接成功');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`用户服务运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  await redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  await redisClient.quit();
  process.exit(0);
});

start();