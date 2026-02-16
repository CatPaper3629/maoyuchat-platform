import request from './index';

export interface GroupMember {
  id: number;
  userId: number;
  username: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface GroupPermission {
  invite: boolean;
  remove: boolean;
  mute: boolean;
  manageAnnouncement: boolean;
  manageSettings: boolean;
  transferOwnership: boolean;
  dissolve: boolean;
}

// 获取群组成员列表
export const getGroupMembers = async (groupId: number) => {
  return request.get<{
    members: GroupMember[];
  }>(`/group/${groupId}/members`);
};

// 设置管理员
export const setGroupAdmin = async (groupId: number, userId: number) => {
  return request.post(`/group/${groupId}/admin`, { userId });
};

// 取消管理员
export const removeGroupAdmin = async (groupId: number, userId: number) => {
  return request.delete(`/group/${groupId}/admin`, { data: { userId } });
};

// 踢出成员
export const kickMember = async (groupId: number, userId: number) => {
  return request.post(`/group/${groupId}/kick`, { userId });
};

// 禁言成员
export const muteMember = async (groupId: number, userId: number, duration: number) => {
  return request.post(`/group/${groupId}/mute`, {
    userId,
    duration, // 禁言时长（秒）
  });
};

// 解除禁言
export const unmuteMember = async (groupId: number, userId: number) => {
  return request.post(`/group/${groupId}/unmute`, { userId });
};

// 转让群主
export const transferOwnership = async (groupId: number, userId: number) => {
  return request.post(`/group/${groupId}/transfer`, { userId });
};

// 更新群组公告
export const updateGroupAnnouncement = async (groupId: number, announcement: string) => {
  return request.put(`/group/${groupId}/announcement`, { announcement });
};

// 更新群组设置
export const updateGroupSettings = async (groupId: number, settings: {
  name?: string;
  avatar?: string;
  maxMembers?: number;
  allowInvite?: boolean;
  requireApproval?: boolean;
}) => {
  return request.put(`/group/${groupId}/settings`, settings);
};

// 获取群组权限
export const getGroupPermissions = async (groupId: number) => {
  return request.get<{
    permissions: GroupPermission;
  }>(`/group/${groupId}/permissions`);
};

// 解散群组
export const dissolveGroup = async (groupId: number) => {
  return request.delete(`/group/${groupId}/dissolve`);
};

// 退出群组
export const leaveGroup = async (groupId: number) => {
  return request.post(`/group/${groupId}/leave`);
};