import { describe, it, expect, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '@/stores/user';
import * as userApi from '@/api/user';

// Mock API
vi.mock('@/api/user', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getUserProfile: vi.fn(),
  updateProfile: vi.fn(),
}));

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          token: 'mock-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
          },
        },
      };

      vi.mocked(userApi.login).mockResolvedValue(mockResponse);

      const store = useUserStore();
      await store.login('testuser', 'password123');

      expect(store.token).toBe('mock-token');
      expect(store.user?.username).toBe('testuser');
      expect(localStorage.getItem('token')).toBe('mock-token');
    });

    it('should handle login error', async () => {
      vi.mocked(userApi.login).mockRejectedValue(new Error('Invalid credentials'));

      const store = useUserStore();
      await expect(store.login('wronguser', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should clear user data on logout', async () => {
      const store = useUserStore();
      store.token = 'mock-token';
      store.user = { id: 1, username: 'test' };

      await store.logout();

      expect(store.token).toBe('');
      expect(store.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});