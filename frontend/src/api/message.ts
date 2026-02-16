import api from './index';
import type { ApiResponse, Message, Conversation } from '@/types';

// 获取会话列表
export const getConversations = () => {
  return api.get<ApiResponse<Conversation[]>>('/conversations');
};

// 获取消息历史
export const getMessages = (receiverType: 'user' | 'group', receiverId: number, page = 1, pageSize = 50) => {
  return api.get<ApiResponse<{ messages: Message[]; total: number }>>('/messages', {
    params: { receiverType, receiverId, page, pageSize },
  });
};

// 发送消息
export const sendMessage = (data: {
  receiverType: 'user' | 'group';
  receiverId: number;
  contentType: string;
  content: string;
  extraData?: any;
  replyToId?: number;
}) => {
  return api.post<ApiResponse<Message>>('/messages', data);
};

// 标记消息已读
export const markAsRead = (messageId: number) => {
  return api.post<ApiResponse>('/messages/read', { messageId });
};

// 撤回消息
export const revokeMessage = (messageId: number) => {
  return api.post<ApiResponse>('/messages/revoke', { messageId });
};

// 上传文件
export const uploadFile = (file: File, fileType: 'image' | 'voice' | 'video' | 'file' = 'file') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  return api.post<ApiResponse<{ fileId: number; accessUrl: string; url: string }>>('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      console.log(`Upload progress: ${percentCompleted}%`);
    },
  });
};