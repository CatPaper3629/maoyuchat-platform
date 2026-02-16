import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { login as loginApi, register as registerApi, getCurrentUser } from '@/api/user';

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const currentUser = ref<User | null>(null);

  const isLoggedIn = computed(() => !!token.value);

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await loginApi(username, password);
      token.value = response.data.token;
      currentUser.value = response.data.user;
      localStorage.setItem('token', response.data.token);
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  // 注册
  const register = async (data: {
    username: string;
    email?: string;
    phone?: string;
    password: string;
    nickname?: string;
  }) => {
    try {
      const response = await registerApi(data);
      token.value = response.data.token;
      currentUser.value = response.data.user;
      localStorage.setItem('token', response.data.token);
      return true;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      currentUser.value = response.data;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      logout();
    }
  };

  // 登出
  const logout = () => {
    token.value = null;
    currentUser.value = null;
    localStorage.removeItem('token');
  };

  return {
    token,
    currentUser,
    isLoggedIn,
    login,
    register,
    fetchCurrentUser,
    logout,
  };
});