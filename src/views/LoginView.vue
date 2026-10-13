<template>
  <div class="enterprise-auth-container">
    <!-- 左侧/背景企业级品牌视觉展示 -->
    <div class="auth-brand-showcase">
      <div class="brand-showcase-content">
        <div class="brand-badge-pill">
          <span class="live-pulse"></span>
          <span>ENTERPRISE IAM · ZERO TRUST GATEWAY</span>
        </div>

        <div class="brand-hero">
          <div class="brand-logo-symbol">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="12" fill="#1e293b"/>
              <path d="M24 8L12 13.5V23C12 30.8 17.1 37.7 24 40C30.9 37.7 36 30.8 36 23V13.5L24 8Z" fill="#2563eb" fill-opacity="0.2" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round"/>
              <circle cx="24" cy="22" r="4.5" stroke="#ffffff" stroke-width="2.2"/>
              <path d="M24 26.5V31.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
              <path d="M22 29H26" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="brand-title">宇宙中心统一身份认证</h1>
          <p class="brand-tagline">Sinopharm Centralized Identity & Access Management</p>
        </div>

        <p class="brand-description">
          面向集团与生态成员单位的下一代标准化身份基础设施，全面兼容 OIDC 1.0 与 OAuth 2.0 规范，提供全生命周期账号鉴权与实时风险阻断。
        </p>

        <!-- 核心安全特性列表 -->
        <div class="feature-matrix">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="feature-text">
              <h4>标准化 OIDC / OAuth2 协议中枢</h4>
              <p>支持 Authorization Code、JWT 凭证签发与无缝跨域单点登录 (SSO)</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="feature-text">
              <h4>毫秒级行为威胁与风控感知</h4>
              <p>Flink 流式处理引擎实时捕捉异地跃迁、连续爆破与异常设备指纹</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="feature-text">
              <h4>多租户组织架构与分级管控</h4>
              <p>打通集团总部与下属分子公司层级架构，支持细粒度权限委托管理</p>
            </div>
          </div>
        </div>

        <div class="brand-footer-seal">
          <div class="seal-item">
            <el-icon><Lock /></el-icon>
            <span>TLS 1.3 加密传输</span>
          </div>
          <span class="seal-divider">·</span>
          <div class="seal-item">
            <el-icon><Check /></el-icon>
            <span>ISO 27001 认证规范</span>
          </div>
          <span class="seal-divider">·</span>
          <div class="seal-item">
            <el-icon><Key /></el-icon>
            <span>国密与高强哈希加固</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧用户鉴权面板 -->
    <div class="auth-panel-wrapper">
      <div class="auth-card-panel">
        <!-- 移动端或小屏幕下显示的 Logo -->
        <div class="mobile-logo-header">
          <div class="mobile-logo-icon">
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="10" fill="#1e293b"/>
              <path d="M24 8L12 13.5V23C12 30.8 17.1 37.7 24 40C30.9 37.7 36 30.8 36 23V13.5L24 8Z" fill="#2563eb" fill-opacity="0.2" stroke="#3b82f6" stroke-width="2.5"/>
              <circle cx="24" cy="22" r="4" stroke="#ffffff" stroke-width="2"/>
              <path d="M24 26V31" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="mobile-logo-title">宇宙中心统一认证</span>
        </div>

        <div class="card-header-section">
          <div class="auth-mode-meta">
            <h2 class="auth-heading">安全登录</h2>
            <p class="auth-subheading">请输入企业统一工号与口令完成身份凭证核验</p>
          </div>

          <!-- 快速填充演示账号快捷按钮 -->
          <button class="dev-quickfill-badge" @click="fillAdminCredentials" type="button" title="点击自动填入开发测试管理员账密">
            <span class="fill-pill">演示账密</span>
            <span class="fill-code">admin / admin</span>
          </button>
        </div>

        <!-- OIDC 授权模式接入应用横幅 -->
        <div v-if="oidcContext.isOidcFlow" class="oidc-flow-banner animate-fade-in">
          <div class="banner-top">
            <span class="oidc-tag">OIDC SSO 授权接入</span>
            <span class="scope-text">{{ oidcContext.scope || 'openid profile' }}</span>
          </div>
          <div class="banner-body">
            正在为应用客户端 <span class="client-id-badge">{{ oidcContext.clientId }}</span> 签发用户身份票据
          </div>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="enterprise-login-form"
          label-position="top"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="企业工号 / 管理员账号" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入工号或管理账号 (例如 admin)"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item label="登录凭证密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入安全访问密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="安全防刷验证码" prop="captchaCode">
            <div class="captcha-flex-row">
              <el-input
                v-model="form.captchaCode"
                placeholder="4位计算结果"
                size="large"
                :prefix-icon="Key"
                maxlength="6"
                class="captcha-input-field"
              />
              <div
                class="captcha-preview-container"
                @click="refreshCaptcha"
                title="点击刷新图形验证码"
              >
                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  alt="验证码"
                  class="captcha-image"
                />
                <div v-else class="captcha-placeholder">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </div>
                <div class="captcha-refresh-hint">
                  <el-icon><Refresh /></el-icon>
                </div>
              </div>
            </div>
          </el-form-item>

          <div class="form-submit-row">
            <el-button
              type="primary"
              size="large"
              class="primary-submit-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ oidcContext.isOidcFlow ? '验证并授权接入业务系统' : '安全登录统一管控中台' }}
            </el-button>
          </div>
        </el-form>

        <div class="auth-security-notice">
          <p class="notice-text">
            若忘记密码或账号被风控系统临时锁定，请联系集团信息安全部管理员申请解锁重置。
          </p>
        </div>

        <div class="panel-bottom-copyright">
          宇宙中心股份有限公司 © 2026 数字科技中心 · 保留所有权利
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { getCaptcha, login } from '../api/auth'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Key,
  Loading,
  Check,
  Aim,
  Connection,
  OfficeBuilding,
  Refresh
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const captchaImage = ref('')

const form = reactive({
  username: '',
  password: '',
  captchaId: '',
  captchaCode: ''
})

const rules = {
  username: [{ required: true, message: '请输入企业账号或工号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入登录口令', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入安全验证码', trigger: 'blur' }]
}

// OIDC 参数解析
const oidcContext = reactive({
  isOidcFlow: false,
  clientId: '',
  redirectUri: '',
  responseType: '',
  state: '',
  nonce: '',
  scope: ''
})

onMounted(() => {
  // 解析 URL 是否有 OIDC 相关参数
  const { client_id, redirect_uri, response_type, state, nonce, scope } = route.query
  if (client_id && redirect_uri) {
    oidcContext.isOidcFlow = true
    oidcContext.clientId = client_id
    oidcContext.redirectUri = redirect_uri
    oidcContext.responseType = response_type || 'code'
    oidcContext.state = state || ''
    oidcContext.nonce = nonce || ''
    oidcContext.scope = scope || 'openid profile'
  }

  refreshCaptcha()
})

// 刷新图形验证码
const refreshCaptcha = async () => {
  try {
    const res = await getCaptcha()
    form.captchaId = res.captchaId
    captchaImage.value = res.captchaImage
    form.captchaCode = ''
  } catch (err) {
    ElMessage.error('获取验证码失败，请确认后端服务运行状态')
  }
}

// 一键填入管理员默认账密
const fillAdminCredentials = () => {
  form.username = 'admin'
  form.password = 'admin'
  ElMessage.success('已自动填充管理员账号与口令 (admin / admin)')
}

// 执行登录
const handleLogin = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const payload = {
        username: form.username,
        password: form.password,
        captchaId: form.captchaId,
        captchaCode: form.captchaCode
      }

      if (oidcContext.isOidcFlow) {
        payload.clientId = oidcContext.clientId
        payload.redirectUri = oidcContext.redirectUri
        payload.responseType = oidcContext.responseType
        payload.state = oidcContext.state
        payload.nonce = oidcContext.nonce
        payload.scope = oidcContext.scope
      }

      const res = await login(payload)
      userStore.setAuth(res.accessToken, res.user)

      ElMessage.success('身份凭证核验通过')

      // 如果是 OIDC 授权跳转模式
      if (oidcContext.isOidcFlow && res.redirectUrl) {
        ElMessage.info(`正在重定向至业务系统: ${res.redirectUrl}`)
        setTimeout(() => {
          window.location.href = res.redirectUrl
        }, 600)
      } else {
        // 普通后台管理模式
        router.push('/admin/dashboard')
      }
    } catch (err) {
      refreshCaptcha()
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.enterprise-auth-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  background-color: #f8fafc;
  overflow: hidden;
}

/* 左侧品牌展示区 */
.auth-brand-showcase {
  flex: 1.1;
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 80px;
  color: #ffffff;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.auth-brand-showcase::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.6;
  pointer-events: none;
}

.brand-showcase-content {
  position: relative;
  z-index: 2;
  max-width: 580px;
}

.brand-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: rgba(37, 99, 235, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #93c5fd;
  margin-bottom: 28px;
}

.live-pulse {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px #60a5fa;
}

.brand-hero {
  margin-bottom: 16px;
}

.brand-logo-symbol {
  margin-bottom: 16px;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 14px;
  color: #94a3b8;
  margin-top: 6px;
  font-weight: 400;
}

.brand-description {
  font-size: 14px;
  line-height: 1.7;
  color: #cbd5e1;
  margin-bottom: 40px;
}

.feature-matrix {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 48px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  font-size: 18px;
  flex-shrink: 0;
}

.feature-text h4 {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.feature-text p {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.brand-footer-seal {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
}

.seal-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.seal-divider {
  color: #475569;
}

/* 右侧登录表单面板 */
.auth-panel-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  background: #f8fafc;
}

.auth-card-panel {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
}

.mobile-logo-header {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.mobile-logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.card-header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.auth-heading {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f172a;
}

.auth-subheading {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

/* 开发者快速填充账号徽章 */
.dev-quickfill-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.dev-quickfill-badge:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.fill-pill {
  font-size: 10px;
  font-weight: 600;
  background: #0284c7;
  color: #ffffff;
  padding: 1px 5px;
  border-radius: 4px;
}

.fill-code {
  font-size: 11px;
  color: #334155;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

/* OIDC 授权横幅 */
.oidc-flow-banner {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 20px;
}

.banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.oidc-tag {
  font-size: 11px;
  font-weight: 600;
  color: #1d4ed8;
}

.scope-text {
  font-size: 11px;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

.banner-body {
  font-size: 12px;
  color: #1e3a8a;
}

.client-id-badge {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  background: #dbeafe;
  padding: 1px 4px;
  border-radius: 4px;
}

/* 登录表单 */
.enterprise-login-form {
  margin-top: 10px;
}

.captcha-flex-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.captcha-input-field {
  flex: 1;
}

.captcha-preview-container {
  width: 120px;
  height: 40px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.captcha-preview-container:hover {
  border-color: #2563eb;
}

.captcha-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  color: #94a3b8;
  font-size: 18px;
}

.captcha-refresh-hint {
  position: absolute;
  right: 4px;
  bottom: 2px;
  font-size: 11px;
  color: #64748b;
  opacity: 0.7;
}

.form-submit-row {
  margin-top: 26px;
}

.primary-submit-btn {
  width: 100%;
  height: 44px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
}

.auth-security-notice {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.notice-text {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.6;
}

.panel-bottom-copyright {
  margin-top: 24px;
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
}

/* 响应式断点 */
@media (max-width: 1024px) {
  .auth-brand-showcase {
    display: none;
  }
  .mobile-logo-header {
    display: flex;
  }
  .auth-panel-wrapper {
    padding: 24px 16px;
  }
}
</style>
