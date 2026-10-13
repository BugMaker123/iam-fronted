import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '统一身份认证登录' }
  },
  {
    path: '/oidc-callback',
    name: 'OidcCallback',
    component: () => import('../views/OidcCallbackView.vue'),
    meta: { title: 'OIDC 业务接入回调调试' }
  },
  {
    path: '/admin',
    component: () => import('../layout/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: { title: '管控大盘与监控', requiresAuth: true }
      },
      {
        path: 'apps',
        name: 'Apps',
        component: () => import('../views/AppsView.vue'),
        meta: { title: 'OIDC应用接入管理', requiresAuth: true }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue'),
        meta: { title: '人员账号管理', requiresAuth: true }
      },
      {
        path: 'companies',
        name: 'Companies',
        component: () => import('../views/CompanyView.vue'),
        meta: { title: '公司组织管理', requiresAuth: true }
      },
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('../views/DeptView.vue'),
        meta: { title: '部门架构管理', requiresAuth: true }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../views/LogsView.vue'),
        meta: { title: '登录审计与日志', requiresAuth: true }
      },
      {
        path: 'risk-center',
        name: 'RiskCenter',
        component: () => import('../views/RiskCenterView.vue'),
        meta: { title: '实时风控与协议中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 宇宙中心IAM` : '宇宙中心统一身份认证'
  const token = localStorage.getItem('iam_token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
