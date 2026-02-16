import api from './index';
import type { ApiResponse, User } from '@/types';

// 用户登录
export const login = (username: string, password: string) => {
  return api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
    username,
    password,
  });
};

// 用户注册
export const register = (data: {
  username: string;
  email?: string;
  phone?: string;
  password: string;
  nickname?: string;
}) => {
  return api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return api.get<ApiResponse<User>>('/user/current');
};

// 更新用户信息
export const updateUser = (data: Partial<User>) => {
  return api.put<ApiResponse<User>>('/user/profile', data);
};

// 上传头像
export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<ApiResponse<{ avatarUrl: string }>>('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 搜索用户
export const searchUsers = (keyword: string) => {
  return api.get<ApiResponse<User[]>>('/user/search', {
    params: { keyword },
  });
};