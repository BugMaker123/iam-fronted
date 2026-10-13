<template>
  <div class="callback-container animate-fade-in">
    <div class="callback-card ui-card">
      <div class="card-header-bar">
        <div class="protocol-badge">
          <span class="live-pulse"></span>
          <span>OIDC 1.0 AUTHORIZATION CODE VERIFICATION</span>
        </div>
        <h2 class="card-title">业务客户端 OIDC 授权回调调试沙箱</h2>
        <p class="card-desc">
          模拟业务系统接入网关接收授权码 <code>code</code>，向 IAM 核心签发端点兑换 Access Token、ID Token 及查询 UserInfo 画像的全流程
        </p>
      </div>

      <!-- 参数解析卡片 -->
      <div class="params-inspector-card">
        <div class="param-item">
          <span class="param-key">回调授权凭据 (Code):</span>
          <div class="param-val-box">
            <code class="param-code">{{ authCode || '未接收到授权码参数 code' }}</code>
            <el-button v-if="authCode" link type="primary" size="small" @click="copyText(authCode, '授权码')">复制</el-button>
          </div>
        </div>
        <div class="param-item">
          <span class="param-key">防重放凭证 (State):</span>
          <div class="param-val-box">
            <code class="param-code">{{ state || '无防重放 state 凭据' }}</code>
          </div>
        </div>
      </div>

      <!-- 自动/手动兑换操作 -->
      <div class="exchange-actions-row">
        <el-button
          type="primary"
          size="large"
          class="exchange-btn"
          :loading="loading"
          @click="exchangeTokens"
        >
          <el-icon><RefreshRight /></el-icon> 模拟向 /oauth2/token 端点兑换 Access Token 与 ID Token
        </el-button>
      </div>

      <!-- 兑换结果展示区 -->
      <div v-if="tokenResult" class="tokens-result-section animate-fade-in">
        <div class="success-alert-bar">
          <el-icon class="check-icon"><CircleCheckFilled /></el-icon>
          <div class="alert-content">
            <strong>凭据兑换成功 (Authorization Code Grant 校验通过)</strong>
            <span>已成功签发标准 JWT 格式的访问令牌与身份令牌</span>
          </div>
        </div>

        <el-descriptions title="令牌载荷 (Token Payload)" :column="2" border class="payload-descriptions">
          <el-descriptions-item label="令牌类型">
            <el-tag size="small">{{ tokenResult.token_type || 'Bearer' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="有效生命周期">
            {{ tokenResult.expires_in }} 秒 ({{ Math.round((tokenResult.expires_in || 7200) / 60) }} 分钟)
          </el-descriptions-item>
          <el-descriptions-item label="Access Token (JWT)" :span="2">
            <div class="token-code-block">
              <code>{{ tokenResult.access_token }}</code>
              <el-button link type="primary" size="small" @click="copyText(tokenResult.access_token, 'Access Token')">复制</el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="OIDC ID Token" :span="2">
            <div class="token-code-block">
              <code>{{ tokenResult.id_token }}</code>
              <el-button link type="primary" size="small" @click="copyText(tokenResult.id_token, 'ID Token')">复制</el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 请求 UserInfo 端点展示 -->
        <div v-if="userInfo" class="userinfo-json-card">
          <div class="json-header">
            <span>/oauth2/userinfo 端点响应身份声明 (Claims Profile)</span>
            <el-button link type="primary" size="small" @click="copyText(userInfo, '用户信息')">复制 JSON</el-button>
          </div>
          <pre class="claims-code-block"><code>{{ userInfo }}</code></pre>
        </div>
      </div>

      <!-- 底部快捷跳转 -->
      <div class="card-footer-actions">
        <el-button @click="$router.push('/admin/dashboard')">
          <el-icon><Back /></el-icon> 返回 IAM 管控大盘
        </el-button>
        <el-button @click="$router.push('/login')">
          <el-icon><User /></el-icon> 重新体验前台单点登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { RefreshRight, Back, User, CircleCheckFilled } from '@element-plus/icons-vue'

const route = useRoute()

const authCode = ref('')
const state = ref('')
const loading = ref(false)
const tokenResult = ref(null)
const userInfo = ref(null)

onMounted(() => {
  authCode.value = route.query.code || ''
  state.value = route.query.state || ''

  if (authCode.value) {
    exchangeTokens()
  }
})

const copyText = (text, label) => {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`已复制 ${label} 到剪贴板`)
  })
}

const exchangeTokens = async () => {
  if (!authCode.value) {
    ElMessage.warning('缺少授权码 code')
    return
  }
  loading.value = true
  try {
    const tokenRes = await axios.post('/oauth2/token', {
      grant_type: 'authorization_code',
      code: authCode.value,
      client_id: 'gk-portal-web',
      client_secret: 'gk_portal_secret_998877',
      redirect_uri: 'http://localhost:5173/oidc-callback'
    })

    tokenResult.value = tokenRes.data
    ElMessage.success('OIDC Token 兑换成功！')

    if (tokenRes.data?.access_token) {
      const infoRes = await axios.get('/oauth2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenRes.data.access_token}`
        }
      })
      userInfo.value = JSON.stringify(infoRes.data, null, 2)
    }
  } catch (err) {
    const msg = err.response?.data?.message || err.message || '兑换 Token 失败，请检查服务状态'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 40px 20px;
}

.callback-card {
  width: 100%;
  max-width: 820px;
  background: #ffffff;
  border-radius: 16px;
  padding: 36px 40px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
}

.card-header-bar {
  text-align: center;
  margin-bottom: 24px;
}

.protocol-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #1d4ed8;
  margin-bottom: 12px;
}

.live-pulse {
  width: 6px;
  height: 6px;
  background: #2563eb;
  border-radius: 50%;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
  line-height: 1.6;
}

.params-inspector-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.param-key {
  width: 160px;
  color: #475569;
  font-weight: 600;
  flex-shrink: 0;
}

.param-val-box {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
}

.param-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #1e40af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exchange-actions-row {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.exchange-btn {
  height: 42px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  border-radius: 8px !important;
}

.tokens-result-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 10px;
}

.success-alert-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 12px 16px;
}

.check-icon {
  font-size: 24px;
  color: #059669;
}

.alert-content {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #065f46;
}

.payload-descriptions {
  margin-top: 4px;
}

.token-code-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.token-code-block code {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  word-break: break-all;
  white-space: pre-wrap;
  color: #1e40af;
  background: #f8fafc;
  padding: 4px 6px;
  border-radius: 4px;
  flex: 1;
}

.userinfo-json-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.json-header {
  padding: 10px 14px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.claims-code-block {
  background: #0f172a;
  color: #38bdf8;
  padding: 16px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.6;
  max-height: 240px;
  overflow-y: auto;
}

.card-footer-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
</style>
