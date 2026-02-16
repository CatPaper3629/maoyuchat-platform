import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string>(localStorage.getItem('admin_token') || '');
  const userInfo = ref<any>(null);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('admin_token', newToken);
  };

  const setUserInfo = (info: any) => {
    userInfo.value = info;
    localStorage.setItem('admin_info', JSON.stringify(info));
  };

  const logout = () => {
    token.value = '';
    userInfo.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  };

  // 初始化用户信息
  if (localStorage.getItem('admin_info')) {
    userInfo.value = JSON.parse(localStorage.getItem('admin_info') || '{}');
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
  };
});