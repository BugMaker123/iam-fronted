<template>
  <div class="apps-container animate-fade-in">
    <!-- 顶部过滤与操作条 -->
    <div class="page-action-bar ui-card">
      <div class="filter-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索接入应用名称 / Client ID"
          clearable
          style="width: 280px;"
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="应用状态"
          clearable
          style="width: 130px;"
          @change="loadData"
        >
          <el-option label="正常启用" :value="1" />
          <el-option label="已下线" :value="0" />
        </el-select>

        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon> 筛选应用
        </el-button>
      </div>

      <div class="bar-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon> 注册新接入应用
        </el-button>
      </div>
    </div>

    <!-- 数据表格卡片 -->
    <div class="table-card ui-card">
      <div class="table-card-header">
        <div class="header-info">
          <span class="table-title">已接入 OIDC 业务客户端列表</span>
          <span class="table-counter">共 {{ total }} 个已纳管应用</span>
        </div>
      </div>

      <el-table :data="appList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="appName" label="接入业务应用" min-width="220">
          <template #default="{ row }">
            <div class="app-info-cell">
              <div class="app-icon-badge">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="app-text-group">
                <span class="app-title-text">{{ row.appName }}</span>
                <span class="app-desc-text">{{ row.description || '无应用描述' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="clientId" label="Client ID" width="180">
          <template #default="{ row }">
            <div class="credential-pill" @click="copyText(row.clientId, 'Client ID')" title="点击复制 Client ID">
              <code class="code-text">{{ row.clientId }}</code>
              <el-icon class="copy-hint-icon"><CopyDocument /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="clientSecret" label="Client Secret" width="170">
          <template #default="{ row }">
            <div class="credential-pill" @click="copyText(row.clientSecret, 'Client Secret')" title="点击复制 Client Secret">
              <code class="code-text">{{ maskSecret(row.clientSecret) }}</code>
              <el-icon class="copy-hint-icon"><CopyDocument /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="grantTypes" label="授权模式" width="180">
          <template #default="{ row }">
            <div class="grant-tags-flex">
              <span
                v-for="grant in (row.grantTypes || '').split(',').filter(Boolean)"
                :key="grant"
                class="grant-pill"
              >
                {{ grant === 'authorization_code' ? 'code 授权码' : grant }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="tokenLifetime" label="Token 有效期" width="120">
          <template #default="{ row }">
            <span class="lifetime-text">{{ formatLifetime(row.tokenLifetime) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用中' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="管理操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="testOidcLogin(row)">
              <el-icon><Promotion /></el-icon> 调试 SSO
            </el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleResetSecret(row)">重置密钥</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页栏 -->
      <div class="table-pagination-footer">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 应用新增 / 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑 OIDC 业务客户端接入配置' : '注册新 OIDC 业务系统客户端'"
      width="640px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="currentApp" :rules="appRules" label-width="120px" class="dialog-form">
        <div class="dialog-section-title">基础身份信息</div>

        <el-form-item label="应用系统名称" prop="appName">
          <el-input v-model="currentApp.appName" placeholder="例如: 宇宙中心医药商业供应链系统 (WMS)" />
        </el-form-item>

        <el-form-item label="Client ID" prop="clientId">
          <el-input
            v-model="currentApp.clientId"
            placeholder="留空则系统自动随机生成全局唯一客户端标识"
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="Client Secret" prop="clientSecret">
          <el-input
            v-model="currentApp.clientSecret"
            placeholder="留空则系统自动生成高强度安全私钥"
            :disabled="isEdit"
          />
        </el-form-item>

        <div class="dialog-section-title">OIDC 协议与安全策略</div>

        <el-form-item label="回调地址白名单" prop="redirectUris">
          <el-input
            v-model="currentApp.redirectUris"
            type="textarea"
            :rows="3"
            placeholder="允许多个回调地址，使用换行或英文逗号隔开，例如:&#10;http://localhost:5173/oidc-callback&#10;https://wms.sinopharm.com/oauth2/callback"
          />
          <div class="field-hint">仅允许在此列表中的域名接收授权码，防止中间人重定向攻击。</div>
        </el-form-item>

        <el-form-item label="支持授权模式" prop="grantTypes">
          <el-checkbox-group v-model="grantTypesArray">
            <el-checkbox label="authorization_code">授权码模式 (authorization_code)</el-checkbox>
            <el-checkbox label="refresh_token">刷新令牌 (refresh_token)</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="Access Token 寿命">
          <el-input-number v-model="currentApp.tokenLifetime" :min="300" :max="86400" :step="600" />
          <span class="unit-span">秒 (推荐 7200 秒 = 2小时)</span>
        </el-form-item>

        <el-form-item label="接入启用状态">
          <el-switch
            v-model="currentApp.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>

        <el-form-item label="业务备注说明">
          <el-input v-model="currentApp.description" type="textarea" :rows="2" placeholder="接入业务场景、安全联调负责人联系方式等" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveAppForm">确认提交配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAppPage, createApp, updateApp, deleteApp, resetAppSecret } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, CopyDocument, Promotion, Connection } from '@element-plus/icons-vue'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const appList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const statusFilter = ref('')

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogFormRef = ref(null)

const currentApp = reactive({
  id: null,
  appName: '',
  clientId: '',
  clientSecret: '',
  redirectUris: '',
  grantTypes: 'authorization_code,refresh_token',
  tokenLifetime: 7200,
  status: 1,
  description: ''
})

const grantTypesArray = ref(['authorization_code', 'refresh_token'])

const appRules = {
  appName: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  redirectUris: [{ required: true, message: '请配置至少一个合法的回调白名单地址', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAppPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value !== '' ? statusFilter.value : undefined
    })
    appList.value = res?.list || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

const formatLifetime = (sec) => {
  if (!sec) return '2 小时'
  if (sec >= 3600) return `${(sec / 3600).toFixed(1)} 小时`
  return `${Math.round(sec / 60)} 分钟`
}

const maskSecret = (secret) => {
  if (!secret) return '******'
  if (secret.length <= 8) return '****'
  return secret.slice(0, 4) + '···' + secret.slice(-4)
}

const copyText = (text, label) => {
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`已复制 ${label} 到剪贴板`)
  })
}

const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(currentApp, {
    id: null,
    appName: '',
    clientId: '',
    clientSecret: '',
    redirectUris: 'http://localhost:5173/oidc-callback',
    grantTypes: 'authorization_code,refresh_token',
    tokenLifetime: 7200,
    status: 1,
    description: ''
  })
  grantTypesArray.value = ['authorization_code', 'refresh_token']
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(currentApp, row)
  grantTypesArray.value = (row.grantTypes || '').split(',').filter(Boolean)
  dialogVisible.value = true
}

const saveAppForm = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      currentApp.grantTypes = grantTypesArray.value.join(',')
      if (isEdit.value) {
        await updateApp(currentApp)
        ElMessage.success('应用客户端配置已更新')
      } else {
        await createApp(currentApp)
        ElMessage.success('新应用注册成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

const handleResetSecret = (row) => {
  ElMessageBox.confirm(
    `确定重置应用 [${row.appName}] 的 Client Secret 吗？重置后原密钥立即失效，需同步更新业务端配置！`,
    '密钥重置警告',
    {
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    const res = await resetAppSecret(row.id)
    ElMessage.success('密钥已重置并生效')
    loadData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定删除接入应用 [${row.appName}] 吗？删除后该应用将无法再通过 OIDC 单点登录！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(async () => {
    await deleteApp(row.id)
    ElMessage.success('应用已移除')
    loadData()
  }).catch(() => {})
}

const testOidcLogin = (row) => {
  const uris = (row.redirectUris || '').split('\n').map(u => u.trim()).filter(Boolean)
  const redirectUri = uris[0] || 'http://localhost:5173/oidc-callback'
  const state = 'state_' + Math.random().toString(36).substring(2, 8)
  const nonce = 'nonce_' + Math.random().toString(36).substring(2, 8)
  const targetUrl = `/login?client_id=${row.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&nonce=${nonce}&scope=openid profile`
  router.push(targetUrl)
}
</script>

<style scoped>
.apps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-action-bar {
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-card {
  overflow: hidden;
}

.table-card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.table-counter {
  font-size: 12px;
  color: #94a3b8;
}

.app-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.app-text-group {
  display: flex;
  flex-direction: column;
}

.app-title-text {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.app-desc-text {
  font-size: 11px;
  color: #94a3b8;
}

.credential-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.credential-pill:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.code-text {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #1e40af;
  background: none;
  border: none;
  padding: 0;
}

.copy-hint-icon {
  font-size: 12px;
  color: #94a3b8;
}

.grant-tags-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.grant-pill {
  font-size: 11px;
  padding: 2px 6px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  font-family: 'JetBrains Mono', monospace;
}

.lifetime-text {
  font-size: 12px;
  color: #64748b;
}

.table-pagination-footer {
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}

/* 弹窗部分 */
.dialog-form {
  padding: 4px 10px;
}

.dialog-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 14px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f1f5f9;
}

.field-hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  line-height: 1.4;
}

.unit-span {
  margin-left: 10px;
  color: #64748b;
  font-size: 12px;
}
</style>
