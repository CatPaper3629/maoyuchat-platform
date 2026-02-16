import axios from 'axios';
import type { ApiResponse } from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          // 未授权，跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('没有权限访问');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败:', data.message || '未知错误');
      }
    }
    return Promise.reject(error);
  }
);

export default api;