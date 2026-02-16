// 用户类型
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatarUrl?: string;
  signature?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastOnlineAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 好友关系类型
export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  remarkName?: string;
  groupId?: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

// 好友分组类型
export interface FriendGroup {
  id: number;
  userId: number;
  groupName: string;
  sortOrder: number;
  createdAt: Date;
}

// 群组类型
export interface Group {
  id: number;
  groupName: string;
  avatarUrl?: string;
  ownerId: number;
  announcement?: string;
  maxMembers: number;
  inviteConfirm: boolean;
  muteAll: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 群成员类型
export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  role: 'owner' | 'admin' | 'member';
  nickname?: string;
  muteUntil?: Date;
  joinedAt: Date;
}

// 消息类型
export interface Message {
  id: number;
  senderId: number;
  receiverType: 'user' | 'group';
  receiverId: number;
  contentType: 'text' | 'image' | 'voice' | 'video' | 'file' | 'location';
  content: string;
  extraData?: any;
  status: 'sent' | 'delivered' | 'read' | 'revoked';
  replyToId?: number;
  createdAt: Date;
}

// 会话类型
export interface Conversation {
  id: number;
  userId: number;
  type: 'single' | 'group';
  targetId: number;
  isPinned: boolean;
  isMuted: boolean;
  lastMessageId?: number;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 文件类型
export interface FileInfo {
  id: number;
  uploaderId: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  storagePath: string;
  accessUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

// WebSocket 消息类型
export interface WSMessage {
  type: 'message' | 'status' | 'typing' | 'notification';
  data: any;
  timestamp: Date;
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}