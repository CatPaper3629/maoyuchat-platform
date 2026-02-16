const pool = require('../config/database');

// 创建群组
const createGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupName, avatarUrl, announcement, maxMembers, inviteConfirm } = req.body;

    if (!groupName) {
      return res.status(400).json({
        code: 400,
        message: '群组名称不能为空',
      });
    }

    // 创建群组
    const [result] = await pool.execute(
      `INSERT INTO groups (group_name, avatar_url, owner_id, announcement, max_members, invite_confirm) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [groupName, avatarUrl || null, userId, announcement || null, maxMembers || 500, inviteConfirm !== false]
    );

    const groupId = result.insertId;

    // 添加创建者为群主
    await pool.execute(
      `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'owner')`,
      [groupId, userId]
    );

    // 获取群组信息
    const [groups] = await pool.execute(
      'SELECT * FROM groups WHERE id = ?',
      [groupId]
    );

    res.status(201).json({
      code: 200,
      message: '创建成功',
      data: groups[0],
    });
  } catch (error) {
    console.error('创建群组失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建群组失败',
    });
  }
};

// 获取群组列表
const getGroupList = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 获取用户所在的群组
    const [groups] = await pool.execute(
      `SELECT g.*, 
              gm.role as user_role,
              gm.joined_at as user_joined_at,
              (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
       FROM \`groups\` g
       INNER JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = ?
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.json({
      code: 200,
      data: groups,
    });
  } catch (error) {
    console.error('获取群组列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取群组列表失败',
    });
  }
};

// 获取群组详情
const getGroupDetail = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    // 检查是否是群组成员
    const [members] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({
        code: 403,
        message: '不是群组成员',
      });
    }

    // 获取群组信息
    const [groups] = await pool.execute(
      'SELECT * FROM groups WHERE id = ?',
      [groupId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '群组不存在',
      });
    }

    // 获取群成员列表
    const [groupMembers] = await pool.execute(
      `SELECT gm.*, u.username, u.nickname, u.avatar_url, u.status
       FROM group_members gm
       LEFT JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.role DESC, gm.joined_at ASC`,
      [groupId]
    );

    res.json({
      code: 200,
      data: {
        group: groups[0],
        members: groupMembers,
        userRole: members[0].role,
      },
    });
  } catch (error) {
    console.error('获取群组详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取群组详情失败',
    });
  }
};

// 邀请成员加入群组
const inviteMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, userIds } = req.body;

    if (!groupId || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      });
    }

    // 检查发送者权限
    const [senders] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (senders.length === 0) {
      return res.status(403).json({
        code: 403,
        message: '不是群组成员',
      });
    }

    const senderRole = senders[0].role;

    // 获取群组信息
    const [groups] = await pool.execute(
      'SELECT * FROM groups WHERE id = ?',
      [groupId]
    );

    if (groups.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '群组不存在',
      });
    }

    const group = groups[0];

    // 检查群组人数限制
    const [memberCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
      [groupId]
    );

    if (memberCount[0].count + userIds.length > group.max_members) {
      return res.status(400).json({
        code: 400,
        message: '群组成员数量已达上限',
      });
    }

    // 添加成员
    const addedMembers = [];
    const failedMembers = [];

    for (const targetUserId of userIds) {
      try {
        // 检查是否已经是成员
        const [existing] = await pool.execute(
          'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
          [groupId, targetUserId]
        );

        if (existing.length > 0) {
          failedMembers.push({ userId: targetUserId, reason: '已是群组成员' });
          continue;
        }

        // 添加到群组
        await pool.execute(
          `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')`,
          [groupId, targetUserId]
        );

        addedMembers.push(targetUserId);
      } catch (error) {
        failedMembers.push({ userId: targetUserId, reason: '添加失败' });
      }
    }

    res.json({
      code: 200,
      message: `成功添加 ${addedMembers.length} 位成员`,
      data: {
        addedMembers,
        failedMembers,
      },
    });
  } catch (error) {
    console.error('邀请成员失败:', error);
    res.status(500).json({
      code: 500,
      message: '邀请成员失败',
    });
  }
};

// 移除群成员
const removeMember = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, memberId } = req.body;

    if (!groupId || !memberId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必要参数',
      });
    }

    // 检查操作者权限
    const [operators] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (operators.length === 0) {
      return res.status(403).json({
        code: 403,
        message: '不是群组成员',
      });
    }

    const operatorRole = operators[0].role;

    // 获取要移除的成员信息
    const [targetMembers] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, memberId]
    );

    if (targetMembers.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '成员不存在',
      });
    }

    const targetRole = targetMembers[0].role;

    // 权限检查
    if (targetRole === 'owner') {
      return res.status(403).json({
        code: 403,
        message: '不能移除群主',
      });
    }

    if (targetRole === 'admin' && operatorRole !== 'owner') {
      return res.status(403).json({
        code: 403,
        message: '只有群主可以移除管理员',
      });
    }

    if (operatorRole === 'member') {
      return res.status(403).json({
        code: 403,
        message: '权限不足',
      });
    }

    // 移除成员
    await pool.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, memberId]
    );

    res.json({
      code: 200,
      message: '移除成功',
    });
  } catch (error) {
    console.error('移除成员失败:', error);
    res.status(500).json({
      code: 500,
      message: '移除成员失败',
    });
  }
};

// 更新群组信息
const updateGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;
    const { groupName, avatarUrl, announcement, maxMembers, inviteConfirm, muteAll } = req.body;

    // 检查权限
    const [members] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({
        code: 403,
        message: '不是群组成员',
      });
    }

    const role = members[0].role;

    if (role === 'member') {
      return res.status(403).json({
        code: 403,
        message: '权限不足',
      });
    }

    // 构建更新语句
    const updates = [];
    const values = [];

    if (groupName !== undefined) {
      updates.push('group_name = ?');
      values.push(groupName);
    }

    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      values.push(avatarUrl);
    }

    if (announcement !== undefined) {
      updates.push('announcement = ?');
      values.push(announcement);
    }

    if (maxMembers !== undefined) {
      updates.push('max_members = ?');
      values.push(maxMembers);
    }

    if (inviteConfirm !== undefined) {
      updates.push('invite_confirm = ?');
      values.push(inviteConfirm);
    }

    if (muteAll !== undefined && role === 'owner') {
      updates.push('mute_all = ?');
      values.push(muteAll);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有提供任何要更新的字段',
      });
    }

    updates.push('updated_at = NOW()');
    values.push(groupId);

    await pool.execute(
      `UPDATE \`groups\` SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // 获取更新后的群组信息
    const [groups] = await pool.execute(
      'SELECT * FROM groups WHERE id = ?',
      [groupId]
    );

    res.json({
      code: 200,
      message: '更新成功',
      data: groups[0],
    });
  } catch (error) {
    console.error('更新群组失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新群组失败',
    });
  }
};

// 解散群组
const dissolveGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    // 检查是否是群主
    const [members] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (members.length === 0) {
      return res.status(403).json({
        code: 403,
        message: '不是群组成员',
      });
    }

    if (members[0].role !== 'owner') {
      return res.status(403).json({
        code: 403,
        message: '只有群主可以解散群组',
      });
    }

    // 删除群成员
    await pool.execute(
      'DELETE FROM group_members WHERE group_id = ?',
      [groupId]
    );

    // 删除群组
    await pool.execute(
      'DELETE FROM groups WHERE id = ?',
      [groupId]
    );

    res.json({
      code: 200,
      message: '解散成功',
    });
  } catch (error) {
    console.error('解散群组失败:', error);
    res.status(500).json({
      code: 500,
      message: '解散群组失败',
    });
  }
};

// 退出群组
const leaveGroup = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId } = req.params;

    // 检查是否是成员
    const [members] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (members.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '不是群组成员',
      });
    }

    if (members[0].role === 'owner') {
      return res.status(400).json({
        code: 400,
        message: '群主不能退出群组',
      });
    }

    // 退出群组
    await pool.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    res.json({
      code: 200,
      message: '退出成功',
    });
  } catch (error) {
    console.error('退出群组失败:', error);
    res.status(500).json({
      code: 500,
      message: '退出群组失败',
    });
  }
};

// 设置管理员
const setAdmin = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, memberId } = req.body;

    // 检查是否是群主
    const [members] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (members.length === 0 || members[0].role !== 'owner') {
      return res.status(403).json({
        code: 403,
        message: '只有群主可以设置管理员',
      });
    }

    // 设置管理员
    await pool.execute(
      `UPDATE group_members SET role = 'admin' WHERE group_id = ? AND user_id = ?`,
      [groupId, memberId]
    );

    res.json({
      code: 200,
      message: '设置成功',
    });
  } catch (error) {
    console.error('设置管理员失败:', error);
    res.status(500).json({
      code: 500,
      message: '设置管理员失败',
    });
  }
};

// 取消管理员
const removeAdmin = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { groupId, memberId } = req.body;

    // 检查是否是群主
    const [members] = await pool.execute(
      `SELECT role FROM group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );

    if (members.length === 0 || members[0].role !== 'owner') {
      return res.status(403).json({
        code: 403,
        message: '只有群主可以取消管理员',
      });
    }

    // 取消管理员
    await pool.execute(
      `UPDATE group_members SET role = 'member' WHERE group_id = ? AND user_id = ?`,
      [groupId, memberId]
    );

    res.json({
      code: 200,
      message: '取消成功',
    });
  } catch (error) {
    console.error('取消管理员失败:', error);
    res.status(500).json({
      code: 500,
      message: '取消管理员失败',
    });
  }
};

module.exports = {
  createGroup,
  getGroupList,
  getGroupDetail,
  inviteMember,
  removeMember,
  updateGroup,
  dissolveGroup,
  leaveGroup,
  setAdmin,
  removeAdmin,
};