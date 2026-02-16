<template>
  <div class="profile-container">
    <el-page-header @back="router.back()" title="返回聊天">
      <template #content>
        <span class="text-large font-600 mr-3"> 个人资料</span>
      </template>
    </el-page-header>

    <el-card class="profile-card" style="margin-top: 20px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-avatar :size="100" :src="form.avatarUrl">
              {{ userStore.currentUser?.nickname?.[0] || 'U' }}
            </el-avatar>
            <el-button type="primary" size="small" style="margin-left: 20px">
              更换头像
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="个性签名">
          <el-input
            v-model="form.signature"
            type="textarea"
            :rows="3"
            placeholder="请输入个性签名"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="在线" value="online" />
            <el-option label="离开" value="away" />
            <el-option label="忙碌" value="busy" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  avatarUrl: '',
  signature: '',
  status: 'online',
});

const handleSave = () => {
  ElMessage.success('保存成功');
  router.back();
};

onMounted(() => {
  if (userStore.currentUser) {
    form.username = userStore.currentUser.username;
    form.nickname = userStore.currentUser.nickname || '';
    form.email = userStore.currentUser.email || '';
    form.phone = userStore.currentUser.phone || '';
    form.avatarUrl = userStore.currentUser.avatarUrl || '';
    form.signature = userStore.currentUser.signature || '';
    form.status = userStore.currentUser.status;
  }
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.avatar-upload {
  display: flex;
  align-items: center;
}
</style>