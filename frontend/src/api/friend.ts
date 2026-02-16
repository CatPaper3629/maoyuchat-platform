import request from './index';

export interface Friend {
  id: number;
  friendId: number;
  username: string;
  avatar?: string;
  remarkName?: string;
  status: 'online' | 'offline' | 'away';
  createdAt: string;
}

export interface Group {
  id: number;
  name: string;
  avatar?: string;
  ownerId: number;
  announcement?: string;
  memberCount: number;
  maxMembers: number;
  createdAt: string;
}

// 添加好友
export const addFriend = async (userId: number, remarkName?: string) => {
  return request.post<{ friendship: Friend }>('/friendship/add', {
    userId,
    remarkName,
  });
};

// 删除好友
export const removeFriend = async (friendId: number) => {
  return request.delete('/friendship/remove', { data: { friendId } });
};

// 获取好友列表
export const getFriendList = async () => {
  return request.get<{ friends: Friend[] }>('/friendship/list');
};

// 修改好友备注
export const updateFriendRemark = async (
  friendId: number,
  remarkName: string
) => {
  return request.put('/friendship/remark', {
    friendId,
    remarkName,
  });
};

// 创建群组
export const createGroup = async (data: {
  name: string;
  avatar?: string;
  announcement?: string;
  memberIds?: number[];
}) => {
  return request.post<{ group: Group }>('/group/create', data);
};

// 加入群组
export const joinGroup = async (groupId: number) => {
  return request.post('/group/join', { groupId });
};

// 退出群组
export const leaveGroup = async (groupId: number) => {
  return request.post('/group/leave', { groupId });
};

// 获取群组列表
export const getGroupList = async () => {
  return request.get<{ groups: Group[] }>('/group/list');
};

// 获取群组成员
export const getGroupMembers = async (groupId: number) => {
  return request.get<{ members: any[] }>(`/group/${groupId}/members`);
};

// 邀请成员
export const inviteMember = async (groupId: number, userId: number) => {
  return request.post(`/group/${groupId}/invite`, { userId });
};

// 移除成员
export const removeMember = async (groupId: number, userId: number) => {
  return request.post(`/group/${groupId}/remove`, { userId });
};

// 添加到黑名单
export const blockUser = async (userId: number) => {
  return request.post('/blocklist/add', { userId });
};

// 从黑名单移除
export const unblockUser = async (userId: number) => {
  return request.post('/blocklist/remove', { userId });
};

// 获取黑名单
export const getBlockList = async () => {
  return request.get<{ blockedUsers: any[] }>('/blocklist/list');
};