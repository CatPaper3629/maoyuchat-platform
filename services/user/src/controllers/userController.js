const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, phone, password, nickname } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
      });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
      });
    }

    // 检查邮箱是否已存在
    if (email) {
      const [existingEmails] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingEmails.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '邮箱已被注册',
        });
      }
    }

    // 检查手机号是否已存在
    if (phone) {
      const [existingPhones] = await pool.execute(
        'SELECT id FROM users WHERE phone = ?',
        [phone]
      );

      if (existingPhones.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '手机号已被注册',
        });
      }
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, phone, password_hash, nickname, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        username,
        email || null,
        phone || null,
        passwordHash,
        nickname || username,
        null,
        'offline',
      ]
    );

    // 生成 token
    const token = jwt.sign(
      { userId: result.insertId, username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 获取用户信息
    const [users] = await pool.execute(
      'SELECT id, username, email, phone, nickname, avatar_url, signature, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      code: 200,
      message: '注册成功',
      data: {
        token,
        user: users[0],
      },
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败',
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
      });
    }

    // 查找用户
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 更新最后登录时间
    await pool.execute(
      'UPDATE users SET last_online_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 返回用户信息（不包含密码）
    const { password_hash, ...userInfo } = user;

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: userInfo,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败',
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [users] = await pool.execute(
      'SELECT id, username, email, phone, nickname, avatar_url, signature, status, last_online_at, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    res.json({
      code: 200,
      data: users[0],
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败',
    });
  }
};

// 更新用户信息
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, email, phone, signature, status } = req.body;

    // 构建更新字段
    const updates = [];
    const values = [];

    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }

    if (email !== undefined) {
      // 检查邮箱是否已被其他用户使用
      const [existingEmails] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingEmails.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '邮箱已被其他用户使用',
        });
      }

      updates.push('email = ?');
      values.push(email);
    }

    if (phone !== undefined) {
      // 检查手机号是否已被其他用户使用
      const [existingPhones] = await pool.execute(
        'SELECT id FROM users WHERE phone = ? AND id != ?',
        [phone, userId]
      );

      if (existingPhones.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '手机号已被其他用户使用',
        });
      }

      updates.push('phone = ?');
      values.push(phone);
    }

    if (signature !== undefined) {
      updates.push('signature = ?');
      values.push(signature);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有提供任何要更新的字段',
      });
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 获取更新后的用户信息
    const [users] = await pool.execute(
      'SELECT id, username, email, phone, nickname, avatar_url, signature, status, last_online_at, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      code: 200,
      message: '更新成功',
      data: users[0],
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败',
    });
  }
};

// 搜索用户
const searchUsers = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        code: 400,
        message: '搜索关键词不能为空',
      });
    }

    const [users] = await pool.execute(
      `SELECT id, username, nickname, avatar_url, status FROM users 
       WHERE username LIKE ? OR nickname LIKE ? 
       LIMIT 20`,
      [`%${keyword}%`, `%${keyword}%`]
    );

    res.json({
      code: 200,
      data: users,
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    res.status(500).json({
      code: 500,
      message: '搜索用户失败',
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateUser,
  searchUsers,
};