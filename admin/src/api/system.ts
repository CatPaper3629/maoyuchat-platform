import request from './index';

// 获取系统概览
export const getSystemOverview = () => {
  return request.get('/admin/system/overview');
};

// 获取在线用户数
export const getOnlineUsers = () => {
  return request.get('/admin/system/online-users');
};

// 获取系统资源使用情况
export const getSystemResources = () => {
  return request.get('/admin/system/resources');
};

// 获取消息统计
export const getMessageStats = (params: { startDate: string; endDate: string }) => {
  return request.get('/admin/stats/messages', { params });
};

// 获取群组统计
export const getGroupStats = () => {
  return request.get('/admin/stats/groups');
};

// 获取活跃度统计
export const getActivityStats = (params: { period: string }) => {
  return request.get('/admin/stats/activity', { params });
};