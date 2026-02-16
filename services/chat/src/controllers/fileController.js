const pool = require('../config/database');
const { minioClient, BUCKET_NAME } = require('../config/minio');
const multer = require('multer');
const path = require('path');

// 配置 multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.mp3', '.mp4', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件类型'));
    }
  },
});

// 上传文件
const uploadFile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请选择文件',
      });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileType = path.extname(file.originalname).substring(1);
    
    // 上传到 MinIO
    await minioClient.putObject(BUCKET_NAME, fileName, file.buffer, {
      'Content-Type': file.mimetype,
    });

    // 生成访问 URL
    const accessUrl = await minioClient.presignedGetObject(BUCKET_NAME, fileName, 24 * 60 * 60); // 24小时有效

    // 保存文件信息到数据库
    const [result] = await pool.execute(
      `INSERT INTO files (uploader_id, file_name, file_size, file_type, mime_type, storage_path, access_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        file.originalname,
        file.size,
        fileType,
        file.mimetype,
        fileName,
        accessUrl,
      ]
    );

    res.json({
      code: 200,
      message: '上传成功',
      data: {
        fileId: result.insertId,
        fileName: file.originalname,
        fileSize: file.size,
        fileType,
        accessUrl,
      },
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    res.status(500).json({
      code: 500,
      message: '上传文件失败',
    });
  }
};

// 获取文件信息
const getFileInfo = async (req, res) => {
  try {
    const { fileId } = req.params;

    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [fileId]
    );

    if (files.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '文件不存在',
      });
    }

    // 生成新的访问 URL
    const accessUrl = await minioClient.presignedGetObject(BUCKET_NAME, files[0].storage_path, 24 * 60 * 60);

    res.json({
      code: 200,
      data: {
        ...files[0],
        accessUrl,
      },
    });
  } catch (error) {
    console.error('获取文件信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取文件信息失败',
    });
  }
};

module.exports = {
  uploadFile,
  getFileInfo,
  upload,
};