-- ============================================
-- 网页聊天平台 - 数据库初始化脚本
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS chat_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE chat_platform;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    signature VARCHAR(200) DEFAULT NULL COMMENT '个性签名',
    status ENUM('online', 'offline', 'away', 'busy') DEFAULT 'offline' COMMENT '在线状态',
    last_online_at TIMESTAMP NULL DEFAULT NULL COMMENT '最后在线时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 好友关系表
-- ============================================
CREATE TABLE friendships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关系ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    friend_id BIGINT NOT NULL COMMENT '好友ID',
    remark_name VARCHAR(50) DEFAULT NULL COMMENT '备注名称',
    group_id BIGINT DEFAULT NULL COMMENT '分组ID',
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'accepted' COMMENT '关系状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_friend (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友关系表';

-- ============================================
-- 3. 好友分组表
-- ============================================
CREATE TABLE friend_groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分组ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    group_name VARCHAR(50) NOT NULL COMMENT '分组名称',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_group (user_id, group_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='好友分组表';

-- ============================================
-- 4. 群组表
-- ============================================
CREATE TABLE groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '群组ID',
    group_name VARCHAR(100) NOT NULL COMMENT '群组名称',
    avatar_url VARCHAR(500) DEFAULT NULL COMMENT '群头像URL',
    owner_id BIGINT NOT NULL COMMENT '群主ID',
    announcement TEXT DEFAULT NULL COMMENT '群公告',
    max_members INT DEFAULT 500 COMMENT '最大成员数',
    invite_confirm BOOLEAN DEFAULT TRUE COMMENT '入群需确认',
    mute_all BOOLEAN DEFAULT FALSE COMMENT '全员禁言',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_owner_id (owner_id),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群组表';

-- ============================================
-- 5. 群成员表
-- ============================================
CREATE TABLE group_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '成员ID',
    group_id BIGINT NOT NULL COMMENT '群组ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role ENUM('owner', 'admin', 'member') DEFAULT 'member' COMMENT '角色',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '群昵称',
    mute_until TIMESTAMP NULL DEFAULT NULL COMMENT '禁言到期时间',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    UNIQUE KEY uk_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='群成员表';

-- ============================================
-- 6. 消息表
-- ============================================
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
    sender_id BIGINT NOT NULL COMMENT '发送者ID',
    receiver_type ENUM('user', 'group') NOT NULL COMMENT '接收者类型',
    receiver_id BIGINT NOT NULL COMMENT '接收者ID',
    content_type ENUM('text', 'image', 'voice', 'video', 'file', 'location') NOT NULL COMMENT '内容类型',
    content TEXT NOT NULL COMMENT '消息内容',
    extra_data JSON DEFAULT NULL COMMENT '额外数据（JSON格式）',
    status ENUM('sent', 'delivered', 'read', 'revoked') DEFAULT 'sent' COMMENT '消息状态',
    reply_to_id BIGINT DEFAULT NULL COMMENT '回复的消息ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_type, receiver_id, created_at),
    INDEX idx_reply_to (reply_to_id),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表';

-- ============================================
-- 7. 消息已读状态表
-- ============================================
CREATE TABLE message_read_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    message_id BIGINT NOT NULL COMMENT '消息ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '已读时间',
    UNIQUE KEY uk_message_user (message_id, user_id),
    INDEX idx_message_id (message_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息已读状态表';

-- ============================================
-- 8. 会话表
-- ============================================
CREATE TABLE conversations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type ENUM('single', 'group') NOT NULL COMMENT '会话类型',
    target_id BIGINT NOT NULL COMMENT '目标ID（用户ID或群组ID）',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT '是否置顶',
    is_muted BOOLEAN DEFAULT FALSE COMMENT '是否免打扰',
    last_message_id BIGINT DEFAULT NULL COMMENT '最后一条消息ID',
    unread_count INT DEFAULT 0 COMMENT '未读消息数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_target (user_id, type, target_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表';

-- ============================================
-- 9. 文件表
-- ============================================
CREATE TABLE files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
    uploader_id BIGINT NOT NULL COMMENT '上传者ID',
    file_name VARCHAR(255) NOT NULL COMMENT '文件名',
    file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
    file_type VARCHAR(50) NOT NULL COMMENT '文件类型',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME类型',
    storage_path VARCHAR(500) NOT NULL COMMENT '存储路径',
    access_url VARCHAR(500) NOT NULL COMMENT '访问URL',
    thumbnail_url VARCHAR(500) DEFAULT NULL COMMENT '缩略图URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_uploader (uploader_id),
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- ============================================
-- 10. 黑名单表
-- ============================================
CREATE TABLE blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    blocked_user_id BIGINT NOT NULL COMMENT '被拉黑的用户ID',
    reason VARCHAR(200) DEFAULT NULL COMMENT '拉黑原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_user_blocked (user_id, blocked_user_id),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='黑名单表';

-- ============================================
-- 初始化管理员用户
-- ============================================
INSERT INTO users (username, email, password_hash, nickname, avatar_url, status) VALUES
('admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '系统管理员', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'online');

-- ============================================
-- 创建测试数据
-- ============================================
INSERT INTO users (username, email, password_hash, nickname, avatar_url, status) VALUES
('user1', 'user1@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '测试用户1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', 'online'),
('user2', 'user2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '测试用户2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', 'offline'),
('user3', 'user3@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '测试用户3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', 'away');

-- 创建测试群组
INSERT INTO groups (group_name, owner_id, announcement) VALUES
('测试群组1', 2, '这是一个测试群组'),
('技术交流群', 3, '欢迎加入技术交流群');

-- 添加群成员
INSERT INTO group_members (group_id, user_id, role) VALUES
(1, 2, 'owner'),
(1, 3, 'member'),
(1, 4, 'member'),
(2, 3, 'owner'),
(2, 4, 'admin');

-- 创建好友关系
INSERT INTO friendships (user_id, friend_id, status) VALUES
(2, 3, 'accepted'),
(2, 4, 'accepted'),
(3, 4, 'accepted');

-- 创建好友分组
INSERT INTO friend_groups (user_id, group_name) VALUES
(2, '我的好友'),
(2, '同事'),
(3, '我的好友');