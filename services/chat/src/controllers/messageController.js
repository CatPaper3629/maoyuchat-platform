const pool = require('../config/database');
const redisClient = require('../config/redis');

// 获取会话列表
const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 查询用户的会话列表
    const [conversations] = await pool.execute(
      `SELECT c.*, 
              CASE 
                WHEN c.type = 'single' THEN u.nickname
                WHEN c.type = 'group' THEN g.group_name
              END as target_name,
              CASE 
                WHEN c.type = 'single' THEN u.avatar_url
                WHEN c.type = 'group' THEN g.avatar_url
              END as target_avatar,
              m.content as last_message_content,
              m.content_type as last_message_type,
              m.created_at as last_message_time
       FROM conversations c
       LEFT JOIN users u ON c.type = 'single' AND c.target_id = u.id
       LEFT JOIN \`groups\` g ON c.type = 'group' AND c.target_id = g.id
       LEFT JOIN messages m ON c.last_message_id = m.id
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json({
      code: 200,
      data: conversations,
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取会话列表失败',
    });
  }
};

// 获取消息历史
const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { receiverType, receiverId, page = 1, pageSize = 50 } = req.query;

    if (!receiverType || !receiverId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      });
    }

    const offset = (page - 1) * pageSize;

    // 获取消息列表
    const [messages] = await pool.execute(
      `SELECT m.*, 
              u.username, 
              u.nickname, 
              u.avatar_url
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.receiver_type = ? 
         AND m.receiver_id = ?
         AND m.status != 'revoked'
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [receiverType, receiverId, parseInt(pageSize), offset]
    );

    // 获取总数
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total
       FROM messages
       WHERE receiver_type = ? 
         AND receiver_id = ?
         AND status != 'revoked'`,
      [receiverType, receiverId]
    );

    res.json({
      code: 200,
      data: {
        messages: messages.reverse(),
        total: countResult[0].total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
      },
    });
  } catch (error) {
    console.error('获取消息历史失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取消息历史失败',
    });
  }
};

// 发送消息
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { receiverType, receiverId, contentType, content, extraData, replyToId } = req.body;

    if (!receiverType || !receiverId || !contentType || !content) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      });
    }

    // 验证接收者
    if (receiverType === 'user') {
      // 检查是否是好友关系
      const [friendships] = await pool.execute(
        `SELECT 1 FROM friendships 
         WHERE user_id = ? AND friend_id = ? AND status = 'accepted'
         UNION
         SELECT 1 FROM friendships 
         WHERE user_id = ? AND friend_id = ? AND status = 'accepted'`,
        [userId, receiverId, receiverId, userId]
      );

      if (friendships.length === 0) {
        return res.status(403).json({
          code: 403,
          message: '只能向好友发送消息',
        });
      }
    } else if (receiverType === 'group') {
      // 检查是否是群组成员
      const [members] = await pool.execute(
        `SELECT 1 FROM group_members 
         WHERE group_id = ? AND user_id = ?`,
        [receiverId, userId]
      );

      if (members.length === 0) {
        return res.status(403).json({
          code: 403,
          message: '不是群组成员',
        });
      }
    }

    // 插入消息
    const [result] = await pool.execute(
      `INSERT INTO messages (sender_id, receiver_type, receiver_id, content_type, content, extra_data, reply_to_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, receiverType, receiverId, contentType, content, JSON.stringify(extraData || {}), replyToId || null]
    );

    // 更新或创建会话
    if (receiverType === 'user') {
      // 更新发送者的会话
      await pool.execute(
        `INSERT INTO conversations (user_id, type, target_id, last_message_id, unread_count, updated_at)
         VALUES (?, 'single', ?, ?, 0, NOW())
         ON DUPLICATE KEY UPDATE 
         last_message_id = VALUES(last_message_id),
         updated_at = VALUES(updated_at)`,
        [userId, receiverId, result.insertId]
      );

      // 更新接收者的会话
      await pool.execute(
        `INSERT INTO conversations (user_id, type, target_id, last_message_id, unread_count, updated_at)
         VALUES (?, 'single', ?, ?, 1, NOW())
         ON DUPLICATE KEY UPDATE 
         last_message_id = VALUES(last_message_id),
         unread_count = unread_count + 1,
         updated_at = VALUES(updated_at)`,
        [receiverId, userId, result.insertId]
      );
    } else if (receiverType === 'group') {
      // 获取所有群成员
      const [members] = await pool.execute(
        `SELECT user_id FROM group_members WHERE group_id = ?`,
        [receiverId]
      );

      // 更新所有群成员的会话
      for (const member of members) {
        if (member.user_id !== userId) {
          await pool.execute(
            `INSERT INTO conversations (user_id, type, target_id, last_message_id, unread_count, updated_at)
             VALUES (?, 'group', ?, ?, 1, NOW())
             ON DUPLICATE KEY UPDATE 
             last_message_id = VALUES(last_message_id),
             unread_count = unread_count + 1,
             updated_at = VALUES(updated_at)`,
            [member.user_id, receiverId, result.insertId]
          );
        } else {
          // 发送者自己的会话
          await pool.execute(
            `INSERT INTO conversations (user_id, type, target_id, last_message_id, unread_count, updated_at)
             VALUES (?, 'group', ?, ?, 0, NOW())
             ON DUPLICATE KEY UPDATE 
             last_message_id = VALUES(last_message_id),
             updated_at = VALUES(updated_at)`,
            [userId, receiverId, result.insertId]
          );
        }
      }
    }

    // 获取完整的消息信息
    const [messages] = await pool.execute(
      `SELECT m.*, u.username, u.nickname, u.avatar_url
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    // 通过 WebSocket 通知接收者
    await notifyReceiver(receiverType, receiverId, userId, messages[0]);

    res.json({
      code: 200,
      message: '发送成功',
      data: messages[0],
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      code: 500,
      message: '发送消息失败',
    });
  }
};

// 标记消息已读
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        code: 400,
        message: '缺少消息ID',
      });
    }

    // 检查消息是否属于用户
    const [messages] = await pool.execute(
      `SELECT * FROM messages WHERE id = ?`,
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在',
      });
    }

    const message = messages[0];

    // 验证权限
    if (message.sender_id === userId) {
      return res.status(400).json({
        code: 400,
        message: '不能标记自己发送的消息',
      });
    }

    // 检查是否是接收者
    if (message.receiver_type === 'user' && message.receiver_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权标记此消息',
      });
    }

    // 插入已读记录
    await pool.execute(
      `INSERT INTO message_read_status (message_id, user_id) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE read_at = NOW()`,
      [messageId, userId]
    );

    // 更新消息状态
    await pool.execute(
      `UPDATE messages SET status = 'read' WHERE id = ?`,
      [messageId]
    );

    // 更新会话未读数
    if (message.receiver_type === 'user') {
      await pool.execute(
        `UPDATE conversations 
         SET unread_count = GREATEST(0, unread_count - 1) 
         WHERE user_id = ? AND type = ? AND target_id = ?`,
        [userId, message.receiver_type, message.receiver_id]
      );
    }

    res.json({
      code: 200,
      message: '标记成功',
    });
  } catch (error) {
    console.error('标记消息已读失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记消息已读失败',
    });
  }
};

// 撤回消息
const revokeMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        code: 400,
        message: '缺少消息ID',
      });
    }

    // 检查消息是否存在
    const [messages] = await pool.execute(
      `SELECT * FROM messages WHERE id = ?`,
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在',
      });
    }

    const message = messages[0];

    // 验证权限
    if (message.sender_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '只能撤回自己发送的消息',
      });
    }

    // 检查时间限制（2分钟内）
    const messageTime = new Date(message.created_at);
    const now = new Date();
    const diffMinutes = (now - messageTime) / 1000 / 60;

    if (diffMinutes > 2) {
      return res.status(400).json({
        code: 400,
        message: '消息发送超过2分钟，无法撤回',
      });
    }

    // 更新消息状态
    await pool.execute(
      `UPDATE messages SET status = 'revoked' WHERE id = ?`,
      [messageId]
    );

    res.json({
      code: 200,
      message: '撤回成功',
    });
  } catch (error) {
    console.error('撤回消息失败:', error);
    res.status(500).json({
      code: 500,
      message: '撤回消息失败',
    });
  }
};

// 通知接收者（通过 Redis 发布）
async function notifyReceiver(receiverType, receiverId, senderId, message) {
  try {
    const notification = {
      type: 'new_message',
      data: {
        receiverType,
        receiverId,
        senderId,
        message,
      },
      timestamp: new Date().toISOString(),
    };

    if (receiverType === 'user') {
      await redisClient.publish(`user:${receiverId}:messages`, JSON.stringify(notification));
    } else if (receiverType === 'group') {
      await redisClient.publish(`group:${receiverId}:messages`, JSON.stringify(notification));
    }
  } catch (error) {
    console.error('通知接收者失败:', error);
  }
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  revokeMessage,
};