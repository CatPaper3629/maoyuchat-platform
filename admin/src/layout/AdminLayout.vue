<template>
  <el-container class="admin-layout">
    <el-aside width="200px" class="aside">
      <div class="logo">
        <el-icon><ChatDotRound /></el-icon>
        <span>聊天平台管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#1890ff"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta.icon" /></el-icon>
          <span>{{ route.meta.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button
            :icon="Fold"
            @click="toggleCollapse"
            circle
          />
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="adminStore.userInfo?.avatar" />
              <span>{{ adminStore.userInfo?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';
import { Fold, ChatDotRound } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const isCollapse = ref(false);

const menuRoutes = computed(() => {
  return route.matched[0]?.children || [];
});

const activeMenu = computed(() => route.path);
const currentRoute = computed(() => route);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

const handleCommand = (command: string) => {
  if (command === 'logout') {
    adminStore.logout();
    router.push('/login');
  } else if (command === 'profile') {
    router.push('/profile');
  }
};
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.aside {
  background-color: #001529;
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 64px;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  border-bottom: 1px solid #1f2937;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.main {
  background: #f0f2f5;
  padding: 20px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item:hover) {
  background-color: #1890ff !important;
}
</style>