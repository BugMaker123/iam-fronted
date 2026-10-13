<template>
  <div class="logs-container animate-fade-in">
    <!-- 顶部筛选操作条 -->
    <div class="page-action-bar ui-card">
      <div class="filter-inputs">
        <el-input
          v-model="searchUsername"
          placeholder="搜索登录账号"
          clearable
          style="width: 180px;"
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-input
          v-model="searchIp"
          placeholder="搜索 IP 地址"
          clearable
          style="width: 180px;"
          @clear="loadData"
          @keyup.enter="loadData"
        />

        <el-select
          v-model="statusFilter"
          placeholder="认证结果"
          clearable
          style="width: 130px;"
          @change="loadData"
        >
          <el-option label="登录成功" :value="1" />
          <el-option label="认证失败" :value="0" />
        </el-select>

        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon> 检索日志
        </el-button>
        <el-button @click="resetFilters">重置条件</el-button>
      </div>

      <div class="bar-meta-badge">
        <span class="live-pulse-dot"></span>
        <span>实时审计链路 (Flink CEP + ES 索引同步)</span>
      </div>
    </div>

    <!-- 日志列表卡片 -->
    <div class="table-card ui-card">
      <div class="table-card-header">
        <div class="header-info">
          <span class="table-title">统一身份认证审计流水</span>
          <span class="table-counter">共记录 {{ total }} 条认证事件</span>
        </div>
      </div>

      <el-table :data="logList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="id" label="事件ID" width="90">
          <template #default="{ row }">
            <span class="id-mono">#{{ row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="username" label="登录账号" width="140">
          <template #default="{ row }">
            <div class="user-inline-item">
              <span class="avatar-mini">{{ (row.username || 'U').charAt(0) }}</span>
              <span class="name-bold">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="loginStatus" label="认证结果" width="105">
          <template #default="{ row }">
            <el-tag :type="row.loginStatus === 1 ? 'success' : 'danger'" size="small">
              {{ row.loginStatus === 1 ? '放行成功' : '校验失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="ipAddress" label="客户端 IP 与地理属地" min-width="190">
          <template #default="{ row }">
            <div class="ip-cell">
              <code class="mono-ip">{{ row.ipAddress }}</code>
              <span class="loc-text">{{ row.location || '内网 / 未解析属地' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="browser" label="终端与操作系统" width="180">
          <template #default="{ row }">
            <span class="device-text">{{ row.browser || 'Unknown' }} · {{ row.os || 'Unknown' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="clientId" label="OIDC 接入端" width="140">
          <template #default="{ row }">
            <span v-if="row.clientId" class="client-badge">{{ row.clientId }}</span>
            <span v-else class="portal-text">IAM 中台直登</span>
          </template>
        </el-table-column>

        <el-table-column prop="riskScore" label="风控评分" width="110">
          <template #default="{ row }">
            <el-tag
              :type="row.riskScore >= 70 ? 'danger' : row.riskScore >= 30 ? 'warning' : 'success'"
              size="small"
            >
              {{ row.riskScore }} 分
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="riskTags" label="风控规则特征" min-width="170">
          <template #default="{ row }">
            <span v-if="row.riskTags" class="risk-tag-badge">{{ row.riskTags }}</span>
            <span v-else class="dim-text">基线正常</span>
          </template>
        </el-table-column>

        <el-table-column prop="errorMessage" label="审计结果状态" min-width="160">
          <template #default="{ row }">
            <span :class="row.loginStatus === 1 ? 'status-ok' : 'status-err'">
              {{ row.errorMessage || (row.loginStatus === 1 ? '凭据校验通过' : '密码不匹配') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="loginTime" label="记录时间" width="170">
          <template #default="{ row }">
            <span class="time-mono">{{ row.loginTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="详情" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="showLogDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
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

    <!-- 日志详情抽屉 -->
    <el-drawer v-model="drawerVisible" title="安全认证与风控审计轨迹详情" size="520px">
      <div v-if="selectedLog" class="log-detail-content">
        <div class="drawer-header-card">
          <div class="drawer-top-row">
            <el-tag :type="selectedLog.loginStatus === 1 ? 'success' : 'danger'" size="large">
              {{ selectedLog.loginStatus === 1 ? '认证通过' : '认证失败 / 拦截' }}
            </el-tag>
            <div class="score-pill">
              <span class="score-title">风控评分</span>
              <strong class="score-num" :class="selectedLog.riskScore >= 70 ? 'danger' : 'safe'">
                {{ selectedLog.riskScore }} 分
              </strong>
            </div>
          </div>
          <h3 class="account-heading">账号: {{ selectedLog.username }}</h3>
        </div>

        <el-descriptions :column="1" border class="drawer-descriptions">
          <el-descriptions-item label="事件记录时间">{{ selectedLog.loginTime }}</el-descriptions-item>
          <el-descriptions-item label="客户端 IP">{{ selectedLog.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="解析地理位置">{{ selectedLog.location || '内网局域网' }}</el-descriptions-item>
          <el-descriptions-item label="终端浏览器">{{ selectedLog.browser || 'Unknown' }}</el-descriptions-item>
          <el-descriptions-item label="操作系统">{{ selectedLog.os || 'Unknown' }}</el-descriptions-item>
          <el-descriptions-item label="OIDC 接入端">{{ selectedLog.clientId || 'IAM 统一管控门户直登' }}</el-descriptions-item>
          <el-descriptions-item label="命中风控规则">{{ selectedLog.riskTags || '未命中高危特征' }}</el-descriptions-item>
          <el-descriptions-item label="返回状态声明">{{ selectedLog.errorMessage || '成功' }}</el-descriptions-item>
          <el-descriptions-item label="原始 User-Agent">
            <div class="raw-ua-block">{{ selectedLog.userAgent || '无 User-Agent 报头' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getLogPage } from '../api/admin'
import { Search } from '@element-plus/icons-vue'

const loading = ref(false)
const logList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const searchUsername = ref('')
const searchIp = ref('')
const statusFilter = ref('')

const drawerVisible = ref(false)
const selectedLog = ref(null)

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getLogPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      username: searchUsername.value,
      ip: searchIp.value,
      status: statusFilter.value !== '' ? statusFilter.value : undefined
    })
    logList.value = res?.list || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  searchUsername.value = ''
  searchIp.value = ''
  statusFilter.value = ''
  loadData()
}

const showLogDetail = (row) => {
  selectedLog.value = row
  drawerVisible.value = true
}
</script>

<style scoped>
.logs-container {
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

.bar-meta-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
  background: #f8fafc;
  padding: 4px 10px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.live-pulse-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
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

.id-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #64748b;
}

.user-inline-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-mini {
  width: 22px;
  height: 22px;
  background: #e2e8f0;
  color: #334155;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.name-bold {
  font-weight: 600;
  color: #0f172a;
}

.ip-cell {
  display: flex;
  flex-direction: column;
}

.mono-ip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #1e293b;
  width: fit-content;
}

.loc-text {
  font-size: 11px;
  color: #94a3b8;
}

.device-text {
  font-size: 12px;
  color: #475569;
}

.client-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #334155;
  font-family: 'JetBrains Mono', monospace;
}

.portal-text {
  font-size: 12px;
  color: #94a3b8;
}

.risk-tag-badge {
  font-size: 11px;
  color: #b45309;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  padding: 2px 6px;
  border-radius: 4px;
}

.dim-text {
  color: #94a3b8;
  font-size: 12px;
}

.status-ok {
  color: #059669;
  font-size: 12px;
}

.status-err {
  color: #e11d48;
  font-size: 12px;
}

.time-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #64748b;
}

.table-pagination-footer {
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}

/* 抽屉内容 */
.log-detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-header-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.drawer-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.score-pill {
  display: flex;
  align-items: center;
  gap: 6px;
}

.score-title {
  font-size: 11px;
  color: #64748b;
}

.score-num {
  font-size: 15px;
  font-family: 'JetBrains Mono', monospace;
}

.score-num.danger { color: #e11d48; }
.score-num.safe { color: #059669; }

.account-heading {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.raw-ua-block {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #475569;
  word-break: break-all;
  line-height: 1.5;
  background: #f8fafc;
  padding: 6px;
  border-radius: 4px;
}
</style>
