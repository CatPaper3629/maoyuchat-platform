<template>
  <div class="group-management">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 成员管理 -->
    <div v-if="activeTab === 'members'" class="tab-content">
      <div class="members-header">
        <h3>成员列表 ({{ members.length }})</h3>
        <div class="filter">
          <input
            v-model="memberFilter"
            type="text"
            placeholder="搜索成员..."
            class="filter-input"
          />
          <select v-model="roleFilter" class="filter-select">
            <option value="">全部角色</option>
            <option value="owner">群主</option>
            <option value="admin">管理员</option>
            <option value="member">普通成员</option>
          </select>
        </div>
      </div>

      <div class="members-list">
        <div
          v-for="member in filteredMembers"
          :key="member.id"
          class="member-item"
        >
          <img :src="member.avatar || '/default-avatar.png'" :alt="member.username" class="avatar" />
          <div class="member-info">
            <div class="username">{{ member.username }}</div>
            <div class="role-badge" :class="member.role">
              {{ getRoleName(member.role) }}
            </div>
          </div>

          <div v-if="canManageMember(member)" class="member-actions">
            <button
              v-if="member.role === 'member'"
              class="action-btn"
              @click="setAdmin(member.userId)"
              title="设为管理员"
            >
              设为管理员
            </button>
            <button
              v-if="member.role === 'admin'"
              class="action-btn"
              @click="removeAdmin(member.userId)"
              title="取消管理员"
            >
              取消管理员
            </button>
            <button
              class="action-btn danger"
              @click="kickMember(member.userId)"
              title="移除成员"
            >
              移除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限设置 -->
    <div v-if="activeTab === 'permissions'" class="tab-content">
      <div class="permission-section">
        <h3>权限设置</h3>
        <div class="permission-list">
          <div
            v-for="(value, key) in permissions"
            :key="key"
            class="permission-item"
          >
            <label class="permission-label">
              <input
                type="checkbox"
                v-model="permissions[key]"
                :disabled="!canEditPermission(key)"
              />
              <span>{{ getPermissionName(key) }}</span>
            </label>
            <span class="permission-desc">{{ getPermissionDesc(key) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 群组设置 -->
    <div v-if="activeTab === 'settings'" class="tab-content">
      <div class="settings-form">
        <div class="form-group">
          <label>群组名称</label>
          <input v-model="settings.name" type="text" class="form-input" />
        </div>

        <div class="form-group">
          <label>群组头像</label>
          <div class="avatar-upload">
            <img :src="settings.avatar || '/default-group.png'" alt="群组头像" class="preview-avatar" />
            <button class="upload-btn">更换头像</button>
          </div>
        </div>

        <div class="form-group">
          <label>最大成员数</label>
          <input v-model.number="settings.maxMembers" type="number" class="form-input" />
        </div>

        <div class="form-group">
          <label>群组公告</label>
          <textarea v-model="settings.announcement" class="form-textarea" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>入群设置</label>
          <div class="toggle-group">
            <label class="toggle-label">
              <input v-model="settings.allowInvite" type="checkbox" />
              <span>允许成员邀请</span>
            </label>
            <label class="toggle-label">
              <input v-model="settings.requireApproval" type="checkbox" />
              <span>需要群主/管理员审核</span>
            </label>
          </div>
        </div>

        <button class="save-btn" @click="saveSettings">保存设置</button>
      </div>
    </div>

    <!-- 危险操作 -->
    <div v-if="activeTab === 'danger'" class="tab-content">
      <div class="danger-zone">
        <h3>危险操作</h3>
        <div class="danger-item">
          <div>
            <h4>转让群主</h4>
            <p>将群主身份转让给其他成员</p>
          </div>
          <button class="btn warning" @click="showTransferDialog = true">转让</button>
        </div>

        <div v-if="isOwner" class="danger-item">
          <div>
            <h4>解散群组</h4>
            <p>解散群组后，所有数据将被删除，无法恢复</p>
          </div>
          <button class="btn danger" @click="showDissolveDialog = true">解散</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  getGroupMembers,
  setGroupAdmin,
  removeGroupAdmin,
  kickMember,
  updateGroupSettings,
  dissolveGroup,
  transferOwnership,
} from '@/api/group';

interface Props {
  groupId: number;
  userRole: 'owner' | 'admin' | 'member';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'settings-updated'): void;
}>();

const activeTab = ref('members');
const members = ref<any[]>([]);
const memberFilter = ref('');
const roleFilter = ref('');
const permissions = ref<any>({});
const settings = ref({
  name: '',
  avatar: '',
  maxMembers: 500,
  announcement: '',
  allowInvite: true,
  requireApproval: false,
});
const showTransferDialog = ref(false);
const showDissolveDialog = ref(false);

const tabs = [
  { id: 'members', label: '成员管理' },
  { id: 'permissions', label: '权限设置' },
  { id: 'settings', label: '群组设置' },
  { id: 'danger', label: '危险操作' },
];

const isOwner = computed(() => props.userRole === 'owner');
const isAdmin = computed(() => props.userRole === 'admin' || isOwner.value);

const filteredMembers = computed(() => {
  return members.value.filter(member => {
    const matchesName = member.username.toLowerCase().includes(memberFilter.value.toLowerCase());
    const matchesRole = !roleFilter.value || member.role === roleFilter.value;
    return matchesName && matchesRole;
  });
});

onMounted(async () => {
  await loadMembers();
});

const loadMembers = async () => {
  try {
    const response = await getGroupMembers(props.groupId);
    members.value = response.data.members;
  } catch (error) {
    console.error('加载成员列表失败:', error);
  }
};

const canManageMember = (member: any) => {
  if (member.userId === currentUserId.value) return false; // 不能管理自己
  if (isOwner.value) return true; // 群主可以管理所有人
  if (isAdmin.value && member.role === 'member') return true; // 管理员可以管理普通成员
  return false;
};

const canEditPermission = (key: string) => {
  return isOwner.value; // 只有群主可以编辑权限
};

const getRoleName = (role: string) => {
  const roleNames: Record<string, string> = {
    owner: '群主',
    admin: '管理员',
    member: '成员',
  };
  return roleNames[role] || role;
};

const getPermissionName = (key: string) => {
  const names: Record<string, string> = {
    invite: '邀请成员',
    remove: '移除成员',
    mute: '禁言成员',
    manageAnnouncement: '管理公告',
    manageSettings: '管理设置',
    transferOwnership: '转让群主',
    dissolve: '解散群组',
  };
  return names[key] || key;
};

const getPermissionDesc = (key: string) => {
  const descs: Record<string, string> = {
    invite: '允许管理员邀请新成员加入群组',
    remove: '允许管理员移除群组成员',
    mute: '允许管理员禁言群组成员',
    manageAnnouncement: '允许管理员修改群组公告',
    manageSettings: '允许管理员修改群组基本设置',
    transferOwnership: '允许转让群主身份',
    dissolve: '允许解散群组',
  };
  return descs[key] || '';
};

const setAdmin = async (userId: number) => {
  if (!confirm('确定要设为管理员吗？')) return;
  
  try {
    await setGroupAdmin(props.groupId, userId);
    await loadMembers();
  } catch (error) {
    console.error('设置管理员失败:', error);
  }
};

const removeAdmin = async (userId: number) => {
  if (!confirm('确定要取消管理员吗？')) return;
  
  try {
    await removeGroupAdmin(props.groupId, userId);
    await loadMembers();
  } catch (error) {
    console.error('取消管理员失败:', error);
  }
};

const kickMember = async (userId: number) => {
  if (!confirm('确定要移除该成员吗？')) return;
  
  try {
    await kickMember(props.groupId, userId);
    await loadMembers();
  } catch (error) {
    console.error('移除成员失败:', error);
  }
};

const saveSettings = async () => {
  try {
    await updateGroupSettings(props.groupId, settings.value);
    alert('设置保存成功');
    emit('settings-updated');
  } catch (error) {
    console.error('保存设置失败:', error);
    alert('保存设置失败');
  }
};

const handleTransferOwnership = async (userId: number) => {
  if (!confirm('确定要转让群主吗？此操作不可撤销！')) return;
  
  try {
    await transferOwnership(props.groupId, userId);
    alert('转让成功');
    // 刷新页面或跳转
  } catch (error) {
    console.error('转让失败:', error);
    alert('转让失败');
  }
};

const handleDissolveGroup = async () => {
  if (!confirm('确定要解散群组吗？此操作不可撤销！所有数据将被删除！')) return;
  
  try {
    await dissolveGroup(props.groupId);
    alert('群组已解散');
    // 跳转到其他页面
  } catch (error) {
    console.error('解散群组失败:', error);
    alert('解散群组失败');
  }
};

// 假设当前用户 ID
const currentUserId = ref(1); // 实际应用中从用户 store 获取
</script>

<style scoped>
.group-management {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #1890ff;
}

.tab-btn.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  font-weight: 500;
}

.tab-content {
  min-height: 400px;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.members-header h3 {
  margin: 0;
  font-size: 16px;
}

.filter {
  display: flex;
  gap: 8px;
}

.filter-input,
.filter-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.members-list {
  max-height: 500px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.member-item:last-child {
  border-bottom: none;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.member-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.role-badge.owner {
  background: #ffec3d;
  color: #333;
}

.role-badge.admin {
  background: #91caff;
  color: #333;
}

.role-badge.member {
  background: #f0f0f0;
  color: #666;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #e8e8e8;
}

.action-btn.danger {
  background: #fff1f0;
  color: #ff4d4f;
}

.action-btn.danger:hover {
  background: #ffccc7;
}

.permission-section h3,
.settings-form h3 {
  margin-bottom: 16px;
  font-size: 16px;
}

.permission-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.permission-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.permission-desc {
  font-size: 12px;
  color: #999;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.upload-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #40a9ff;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.save-btn {
  width: 100%;
  padding: 10px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #40a9ff;
}

.danger-zone h3 {
  color: #ff4d4f;
  margin-bottom: 16px;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  margin-bottom: 12px;
}

.danger-item h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #ff4d4f;
}

.danger-item p {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.3s;
}

.btn:hover {
  opacity: 0.8;
}

.btn.warning {
  background: #faad14;
  color: white;
}

.btn.danger {
  background: #ff4d4f;
  color: white;
}
</style>