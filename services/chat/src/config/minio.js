require('dotenv').config();
const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'chat-files';

// 确保存储桶存在
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`存储桶 ${BUCKET_NAME} 创建成功`);
    }
  } catch (error) {
    console.error('MinIO 存储桶检查失败:', error);
  }
}

module.exports = { minioClient, ensureBucket, BUCKET_NAME };