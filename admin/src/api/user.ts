import request from './index';

// 管理员登录
export const adminLogin = (data: { username: string; password: string }) => {
  return request.post('/admin/login', data);
};

// 获取用户列表
export const getUserList = (params: {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}) => {
  return request.get('/admin/users', { params });
};

// 获取用户详情
export const getUserDetail = (userId: number) => {
  return request.get(`/admin/users/${userId}`);
};

// 更新用户信息
export const updateUser = (userId: number, data: any) => {
  return request.put(`/admin/users/${userId}`, data);
};

// 封禁用户
export const banUser = (userId: number, reason: string) => {
  return request.post(`/admin/users/${userId}/ban`, { reason });
};

// 解封用户
export const unbanUser = (userId: number) => {
  return request.post(`/admin/users/${userId}/unban`);
};

// 删除用户
export const deleteUser = (userId: number) => {
  return request.delete(`/admin/users/${userId}`);
};

// 获取用户统计
export const getUserStats = () => {
  return request.get('/admin/stats/users');
};