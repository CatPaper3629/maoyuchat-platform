import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('@/views/Chat.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else if (!to.meta.requiresAuth && userStore.isLoggedIn) {
    next('/chat');
  } else {
    next();
  }
});

export default router;