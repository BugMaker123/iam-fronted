<template>
  <div class="admin-shell">
    <!-- 侧边导航栏 -->
    <aside class="shell-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <!-- 品牌 Header -->
      <div class="sidebar-brand">
        <div class="brand-link" @click="$router.push('/admin/dashboard')">
          <div class="brand-logo-glyph">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#1e293b"/>
              <path d="M16 6L8 9.5V16C8 21.2 11.4 25.8 16 27C20.6 25.8 24 21.2 24 16V9.5L16 6Z" fill="#2563eb" fill-opacity="0.25" stroke="#3b82f6" stroke-width="2"/>
              <path d="M16 11V21M12 16H20" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="brand-text" v-if="!isCollapsed">
            <span class="brand-title">宇宙中心 IAM</span>
            <span class="brand-sub">企业统一认证中台</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <!-- 分组 1: 核心概览 -->
        <div class="nav-section" v-if="!isCollapsed">
          <span class="section-label">运行监控</span>
        </div>
        <router-link
          to="/admin/dashboard"
          class="nav-item"
          :class="{ 'is-active': currentPath === '/admin/dashboard' }"
        >
          <el-icon class="nav-icon"><Odometer /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">管控大盘</span>
        </router-link>

        <router-link
          to="/admin/apps"
          class="nav-item"
          :class="{ 'is-active': currentPath.startsWith('/admin/apps') }"
        >
          <el-icon class="nav-icon"><Connection /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">应用接入管理</span>
          <span class="nav-badge" v-if="!isCollapsed">OIDC</span>
        </router-link>

        <!-- 分组 2: 组织与身份 -->
        <div class="nav-section" v-if="!isCollapsed">
          <span class="section-label">组织与身份治理</span>
        </div>
        <router-link
          to="/admin/users"
          class="nav-item"
          :class="{ 'is-active': currentPath.startsWith('/admin/users') }"
        >
          <el-icon class="nav-icon"><User /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">人员账号管理</span>
        </router-link>

        <router-link
          to="/admin/companies"
          class="nav-item"
          :class="{ 'is-active': currentPath.startsWith('/admin/companies') }"
        >
          <el-icon class="nav-icon"><OfficeBuilding /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">公司组织架构</span>
        </router-link>

        <router-link
          to="/admin/departments"
          class="nav-item"
          :class="{ 'is-active': currentPath.startsWith('/admin/departments') }"
        >
          <el-icon class="nav-icon"><SetUp /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">部门树形架构</span>
        </router-link>

        <!-- 分组 3: 安全与风控 -->
        <div class="nav-section" v-if="!isCollapsed">
          <span class="section-label">安全合规与流计算</span>
        </div>
        <router-link
          to="/admin/logs"
          class="nav-item"
          :class="{ 'is-active': currentPath.startsWith('/admin/logs') }"
        >
          <el-icon class="nav-icon"><Document /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">登录审计日志</span>
        </router-link>

        <router-link
          to="/admin/risk-center"
          class="nav-item"
          :class="{ 'is-active': currentPath.startsWith('/admin/risk-center') }"
        >
          <el-icon class="nav-icon"><Aim /></el-icon>
          <span class="nav-text" v-if="!isCollapsed">实时风控沙箱</span>
          <span class="nav-badge alert" v-if="!isCollapsed">Flink</span>
        </router-link>
      </nav>

      <!-- 侧边栏底部状态 -->
      <div class="sidebar-bottom">
        <div class="cluster-health" v-if="!isCollapsed">
          <div class="health-dot"></div>
          <div class="health-meta">
            <span class="health-title">OIDC & Flink Ready</span>
            <span class="health-sub">安全策略生效中</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧主体内容容器 -->
    <div class="shell-main">
      <!-- 顶栏 Header -->
      <header class="shell-header">
        <div class="header-left">
          <button
            class="collapse-toggle-btn"
            @click="isCollapsed = !isCollapsed"
            :title="isCollapsed ? '展开菜单' : '收起菜单'"
          >
            <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </button>

          <div class="breadcrumb-container">
            <span class="breadcrumb-root">统一认证中台</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">{{ currentTitle }}</span>
          </div>
        </div>

        <div class="header-right">
          <!-- 服务运行状态指示 -->
          <div class="service-status-pill">
            <span class="status-indicator-dot"></span>
            <span>服务端口: 8088</span>
          </div>

          <!-- SSO 前台演示跳转 -->
          <el-tooltip content="体验企业前台统一SSO单点登录页" placement="bottom">
            <el-button class="header-action-btn" size="small" @click="goToSsoLogin">
              <el-icon><Right /></el-icon> 前台SSO登录
            </el-button>
          </el-tooltip>

          <!-- OIDC Discovery -->
          <el-tooltip content="查看 OpenID Connect Discovery 元数据" placement="bottom">
            <el-button class="header-action-btn" size="small" @click="openOidcDiscovery">
              <el-icon><Link /></el-icon> OIDC Discovery
            </el-button>
          </el-tooltip>

          <div class="header-divider"></div>

          <!-- 用户信息下拉 -->
          <el-dropdown trigger="click" @command="handleUserCommand">
            <div class="user-trigger">
              <div class="avatar-badge">
                {{ userInitial }}
              </div>
              <div class="user-details">
                <span class="user-display-name">{{ userStore.realName || userStore.username }}</span>
                <span class="user-role-label">超级管理员</span>
              </div>
              <el-icon class="dropdown-chevron"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon> 账户中心
                </el-dropdown-item>
                <el-dropdown-item command="risk">
                  <el-icon><Aim /></el-icon> 实时风控沙箱
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon> 退出安全登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 视图主要内容展示区 -->
      <main class="shell-content">
        <router-view v-slot="{ Component }">
          <transition name="view-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Odometer,
  Connection,
  User,
  OfficeBuilding,
  SetUp,
  Document,
  Aim,
  Fold,
  Expand,
  ArrowDown,
  Right,
  Link,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapsed = ref(false)

const currentPath = computed(() => route.path)
const currentTitle = computed(() => route.meta.title || '管控大盘')

const userInitial = computed(() => {
  const name = userStore.realName || userStore.username || 'A'
  return name.charAt(0).toUpperCase()
})

const goToSsoLogin = () => {
  router.push('/login')
}

const openOidcDiscovery = () => {
  window.open('http://localhost:8088/.well-known/openid-configuration', '_blank')
}

const handleUserCommand = (cmd) => {
  if (cmd === 'logout') {
    ElMessageBox.confirm('确定要退出宇宙中心统一身份认证控制台吗？', '安全退出提示', {
      confirmButtonText: '确认退出',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await userStore.logout()
      ElMessage.success('已安全退出会话')
      router.push('/login')
    }).catch(() => {})
  } else if (cmd === 'risk') {
    router.push('/admin/risk-center')
  } else if (cmd === 'profile') {
    router.push('/admin/users')
  }
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f8fafc;
  overflow: hidden;
}

/* 侧边导航栏 */
.shell-sidebar {
  width: 240px;
  height: 100%;
  background: #0f172a;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: 1px solid #1e293b;
  flex-shrink: 0;
  z-index: 20;
}

.shell-sidebar.is-collapsed {
  width: 68px;
}

.sidebar-brand {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  border-bottom: 1px solid #1e293b;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}

.brand-logo-glyph {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.brand-title {
  font-size: 15px;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.brand-sub {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
}

/* 导航列表 */
.sidebar-nav {
  flex: 1;
  padding: 14px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-section {
  padding: 14px 10px 6px 10px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
  text-decoration: none;
}

.nav-item:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.is-active {
  color: #ffffff;
  background: #1e293b;
  font-weight: 600;
}

.nav-item.is-active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  background: #3b82f6;
  border-radius: 0 3px 3px 0;
}

.nav-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.nav-badge.alert {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.25);
}

.sidebar-bottom {
  padding: 14px 16px;
  border-top: 1px solid #1e293b;
}

.cluster-health {
  display: flex;
  align-items: center;
  gap: 10px;
}

.health-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
  flex-shrink: 0;
}

.health-meta {
  display: flex;
  flex-direction: column;
}

.health-title {
  font-size: 11px;
  font-weight: 600;
  color: #cbd5e1;
}

.health-sub {
  font-size: 10px;
  color: #64748b;
}

/* 右侧主体工作区 */
.shell-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8fafc;
}

.shell-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-toggle-btn {
  background: none;
  border: 1px solid #e2e8f0;
  font-size: 16px;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.collapse-toggle-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.breadcrumb-root {
  color: #64748b;
}

.breadcrumb-sep {
  color: #cbd5e1;
}

.breadcrumb-current {
  font-weight: 600;
  color: #0f172a;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  font-size: 11px;
  color: #475569;
  font-family: 'JetBrains Mono', monospace;
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.header-action-btn {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #cbd5e1 !important;
  font-size: 12px !important;
}

.header-action-btn:hover {
  background: #f8fafc !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
}

.header-divider {
  width: 1px;
  height: 20px;
  background-color: #e2e8f0;
  margin: 0 4px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}

.user-trigger:hover {
  background: #f1f5f9;
}

.avatar-badge {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #1e293b;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-display-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}

.user-role-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 1px;
}

.dropdown-chevron {
  font-size: 12px;
  color: #94a3b8;
}

.shell-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f8fafc;
}

/* 页面切换动画 */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
