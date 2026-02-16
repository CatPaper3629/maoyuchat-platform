import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layout/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '仪表盘', icon: 'DataAnalysis' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/Index.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'content',
        name: 'Content',
        component: () => import('@/views/content/Index.vue'),
        meta: { title: '内容管理', icon: 'Document' },
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/system/Index.vue'),
        meta: { title: '系统监控', icon: 'Monitor' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/settings/Index.vue'),
        meta: { title: '系统设置', icon: 'Setting' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token');
  
  if (to.path !== '/login' && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;