import request from './index';

export interface SearchResult {
  type: 'user' | 'group' | 'message';
  id: number;
  name?: string;
  avatar?: string;
  content?: string;
  receiverType?: 'user' | 'group';
  receiverId?: number;
  createdAt?: string;
}

// 搜索会话（好友和群组）
export const searchConversations = async (keyword: string) => {
  return request.get<{
    users: Array<{
      id: number;
      username: string;
      avatar?: string;
      status: string;
    }>;
    groups: Array<{
      id: number;
      name: string;
      avatar?: string;
      memberCount: number;
    }>;
  }>('/search/conversations', {
    params: { keyword },
  });
};

// 搜索消息
export const searchMessages = async (params: {
  keyword: string;
  receiverType?: 'user' | 'group';
  receiverId?: number;
  page?: number;
  pageSize?: number;
}) => {
  return request.get<{
    messages: Array<{
      id: number;
      senderId: number;
      senderName: string;
      senderAvatar?: string;
      receiverType: 'user' | 'group';
      receiverId: number;
      receiverName?: string;
      contentType: string;
      content: string;
      createdAt: string;
    }>;
    total: number;
  }>('/search/messages', {
    params,
  });
};

// 搜索用户
export const searchUsers = async (keyword: string) => {
  return request.get<{
    users: Array<{
      id: number;
      username: string;
      avatar?: string;
      bio?: string;
    }>;
  }>('/search/users', {
    params: { keyword },
  });
};

// 获取搜索历史
export const getSearchHistory = async () => {
  return request.get<{
    history: string[];
  }>('/search/history');
};

// 清空搜索历史
export const clearSearchHistory = async () => {
  return request.delete('/search/history');
};

// 添加搜索历史
export const addSearchHistory = async (keyword: string) => {
  return request.post('/search/history', { keyword });
};