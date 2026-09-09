import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/LoginView.vue'),
          meta: { public: true },
        },
      ],
    },
    {
      path: '/tender',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'details',
          name: 'tender',
          component: () => import('@/views/TenderView.vue'),
          meta: { public: true },
        },
      ],
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'diagnosis/workbench',
          name: 'diagnosis',
          component: () => import('@/views/DiagnosisView.vue'),
          meta: { roles: ['admin', 'manager', 'doctor'] },
        },
        {
          path: 'bid/blind-review',
          name: 'blind-review',
          component: () => import('@/views/BlindReviewView.vue'),
          meta: { roles: ['admin', 'manager'] },
        },
        {
          path: 'assets/management',
          name: 'assets',
          component: () => import('@/views/AssetsView.vue'),
          meta: { roles: ['admin', 'manager', 'decider'] },
        },
        {
          path: 'audit/logs',
          name: 'audit-logs',
          component: () => import('@/views/AuditLogsView.vue'),
          meta: { roles: ['admin'] },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.ready) auth.restore()

  if (to.meta.public) {
    if (auth.isAuthenticated && to.name === 'login') return { name: 'dashboard' }
    return true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && !roles.includes(auth.role)) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
