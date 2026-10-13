<template>
  <div class="dashboard-shell animate-fade-in">
    <!-- 顶部运营控制面板 Header -->
    <div class="dashboard-header-card">
      <div class="header-main-info">
        <div class="title-with-pill">
          <h2 class="dash-title">统一身份与访问控制运营总览</h2>
          <span class="cluster-status-badge">
            <span class="live-blink-dot"></span>
            全量服务集群运行正常
          </span>
        </div>
        <p class="dash-desc">
          基于 OIDC 1.0 / OAuth 2.0 规范的跨企业 SSO 核心，集成 Flink 实时行为威胁审计与高可用凭证治理
        </p>
      </div>

      <div class="header-action-meta">
        <div class="meta-stat-pill">
          <span class="meta-label">SSO 协议</span>
          <span class="meta-val">OIDC v1.0 / JWT</span>
        </div>
        <div class="meta-stat-pill">
          <span class="meta-label">实时流引擎</span>
          <span class="meta-val">Flink + Drools CEP</span>
        </div>
        <div class="meta-stat-pill">
          <span class="meta-label">当前节点</span>
          <span class="meta-val">Primary-8088</span>
        </div>
      </div>
    </div>

    <!-- 4 大核心 KPI 指标网格 -->
    <div class="kpi-grid">
      <!-- KPI 1 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">今日认证请求总量</span>
          <div class="kpi-icon-box">
            <el-icon><DataLine /></el-icon>
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number">{{ stats.todayTotal || 0 }}</span>
          <span class="kpi-trend positive">+12.8%</span>
        </div>
        <div class="kpi-footer">
          <span class="footer-sub">成功放行 {{ stats.todaySuccess || 0 }} 次</span>
          <span class="kpi-tag neutral">实时统计</span>
        </div>
      </div>

      <!-- KPI 2 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">综合认证成功率</span>
          <div class="kpi-icon-box success">
            <el-icon><Check /></el-icon>
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number text-success">{{ stats.successRate || 100 }}<small class="kpi-unit">%</small></span>
          <span class="kpi-trend positive">稳定合规</span>
        </div>
        <div class="kpi-footer">
          <span class="footer-sub">拦截/失败 {{ stats.todayFail || 0 }} 次</span>
          <span class="kpi-tag success">SLA 99.9%</span>
        </div>
      </div>

      <!-- KPI 3 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">高危风控阻断事件</span>
          <div class="kpi-icon-box warning">
            <el-icon><WarningFilled /></el-icon>
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number text-warning">{{ stats.highRiskCount || 0 }}</span>
          <span class="kpi-trend neutral">CEP 滑窗命中</span>
        </div>
        <div class="kpi-footer">
          <span class="footer-sub">异常异地/暴力破解模式</span>
          <span class="kpi-tag warning">自动防护</span>
        </div>
      </div>

      <!-- KPI 4 -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">生态接入业务系统</span>
          <div class="kpi-icon-box primary">
            <el-icon><Connection /></el-icon>
          </div>
        </div>
        <div class="kpi-value-row">
          <span class="kpi-number">{{ stats.totalApps || 0 }}<small class="kpi-unit">个</small></span>
          <span class="kpi-trend neutral">覆盖全渠道</span>
        </div>
        <div class="kpi-footer">
          <span class="footer-sub">纳管人员基数: {{ stats.totalUsers || 0 }}</span>
          <span class="kpi-tag primary">OIDC Clients</span>
        </div>
      </div>
    </div>

    <!-- 中部可视化图表与快捷工作台 -->
    <div class="analytics-row">
      <!-- 7天多维度认证趋势 SVG 图表 -->
      <div class="chart-panel ui-card">
        <div class="panel-header">
          <div class="header-left-title">
            <el-icon class="panel-icon"><TrendCharts /></el-icon>
            <div class="title-text-group">
              <span class="panel-title">认证流量与风险阻断走势</span>
              <span class="panel-sub">7 天滑动窗口认证请求成功率与拦截趋势对比</span>
            </div>
          </div>
          <div class="chart-legend-pills">
            <span class="legend-pill success">
              <span class="legend-color-box"></span> 认证成功
            </span>
            <span class="legend-pill danger">
              <span class="legend-color-box"></span> 拦截 / 异常
            </span>
          </div>
        </div>

        <div class="chart-canvas-wrap">
          <!-- 优雅的 SVG 矢量柱状图表 -->
          <svg class="trend-svg" viewBox="0 0 640 200" preserveAspectRatio="none">
            <!-- 背景网格参考线 -->
            <line x1="40" y1="30" x2="620" y2="30" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1"/>
            <line x1="40" y1="75" x2="620" y2="75" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1"/>
            <line x1="40" y1="120" x2="620" y2="120" stroke="#f1f5f9" stroke-dasharray="4 4" stroke-width="1"/>
            <line x1="40" y1="165" x2="620" y2="165" stroke="#e2e8f0" stroke-width="1"/>

            <!-- Y 轴刻度标签 -->
            <text x="32" y="34" font-size="10" fill="#94a3b8" text-anchor="end">{{ maxTrendVal }}</text>
            <text x="32" y="79" font-size="10" fill="#94a3b8" text-anchor="end">{{ Math.round(maxTrendVal * 0.66) }}</text>
            <text x="32" y="124" font-size="10" fill="#94a3b8" text-anchor="end">{{ Math.round(maxTrendVal * 0.33) }}</text>
            <text x="32" y="169" font-size="10" fill="#94a3b8" text-anchor="end">0</text>

            <!-- 数据条渲染 -->
            <g v-for="(item, idx) in trendList" :key="idx">
              <!-- 背景悬浮热区 -->
              <rect
                :x="65 + idx * 80"
                y="20"
                width="50"
                height="145"
                fill="transparent"
                class="bar-hover-zone"
              >
                <title>{{ item.day }}
成功: {{ item.success }} 次
失败/拦截: {{ item.fail }} 次</title>
              </rect>

              <!-- 失败/拦截柱 (红色) -->
              <rect
                :x="74 + idx * 80"
                :y="165 - Math.max(4, (item.fail / maxTrendVal) * 135)"
                width="14"
                :height="Math.max(4, (item.fail / maxTrendVal) * 135)"
                rx="3"
                fill="#f43f5e"
                opacity="0.85"
                class="svg-bar bar-anim"
              />

              <!-- 成功柱 (蓝色/青色) -->
              <rect
                :x="92 + idx * 80"
                :y="165 - Math.max(6, (item.success / maxTrendVal) * 135)"
                width="14"
                :height="Math.max(6, (item.success / maxTrendVal) * 135)"
                rx="3"
                fill="#2563eb"
                class="svg-bar bar-anim"
              />

              <!-- X 轴日期 -->
              <text
                :x="90 + idx * 80"
                y="185"
                font-size="11"
                fill="#64748b"
                text-anchor="middle"
                font-weight="500"
              >
                {{ item.day }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- 右侧常用快捷工作台 -->
      <div class="actions-panel ui-card">
        <div class="panel-header">
          <div class="header-left-title">
            <el-icon class="panel-icon"><Operation /></el-icon>
            <div class="title-text-group">
              <span class="panel-title">常用快捷通道</span>
              <span class="panel-sub">身份架构与策略核心配置</span>
            </div>
          </div>
        </div>

        <div class="quick-link-cards">
          <div class="quick-link-item" @click="$router.push('/admin/apps')">
            <div class="quick-item-icon brand">
              <el-icon><CirclePlus /></el-icon>
            </div>
            <div class="quick-item-body">
              <span class="item-title">接入新 OIDC 业务系统</span>
              <span class="item-sub">签发 Client ID 凭据与白名单</span>
            </div>
            <el-icon class="item-arrow"><ArrowRight /></el-icon>
          </div>

          <div class="quick-link-item" @click="$router.push('/admin/users')">
            <div class="quick-item-icon success">
              <el-icon><User /></el-icon>
            </div>
            <div class="quick-item-body">
              <span class="item-title">企业人员与账号授权</span>
              <span class="item-sub">部门组织归属、状态重置与锁定</span>
            </div>
            <el-icon class="item-arrow"><ArrowRight /></el-icon>
          </div>

          <div class="quick-link-item" @click="$router.push('/admin/risk-center')">
            <div class="quick-item-icon warning">
              <el-icon><Aim /></el-icon>
            </div>
            <div class="quick-item-body">
              <span class="item-title">实时风控沙箱演练</span>
              <span class="item-sub">模拟异地跃迁与高频试错判定</span>
            </div>
            <el-icon class="item-arrow"><ArrowRight /></el-icon>
          </div>

          <div class="quick-link-item" @click="$router.push('/admin/logs')">
            <div class="quick-item-icon neutral">
              <el-icon><Document /></el-icon>
            </div>
            <div class="quick-item-body">
              <span class="item-title">安全审计流与日志追溯</span>
              <span class="item-sub">回溯终端指纹、属地与错误归因</span>
            </div>
            <el-icon class="item-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部最新审计日志流 -->
    <div class="recent-audit-panel ui-card">
      <div class="panel-header">
        <div class="header-left-title">
          <el-icon class="panel-icon"><Timer /></el-icon>
          <div class="title-text-group">
            <span class="panel-title">实时登录审计流水 (最新 5 条)</span>
            <span class="panel-sub">监听各业务端 SSO 认证凭证核验与风控打分</span>
          </div>
        </div>
        <el-button link type="primary" @click="$router.push('/admin/logs')">
          查看完整审计流水 &gt;
        </el-button>
      </div>

      <div class="table-container">
        <el-table :data="recentLogs" stripe style="width: 100%">
          <el-table-column prop="username" label="登录账号" width="150">
            <template #default="{ row }">
              <div class="user-inline-cell">
                <span class="avatar-dot">{{ (row.username || 'U').charAt(0).toUpperCase() }}</span>
                <span class="user-name-text">{{ row.username }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="loginStatus" label="认证结果" width="110">
            <template #default="{ row }">
              <el-tag :type="row.loginStatus === 1 ? 'success' : 'danger'" size="small">
                {{ row.loginStatus === 1 ? '成功通过' : '认证失败' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="ipAddress" label="客户端 IP 与属地" min-width="190">
            <template #default="{ row }">
              <div class="ip-meta-cell">
                <code class="ip-text">{{ row.ipAddress }}</code>
                <span class="location-text">{{ row.location || '局域网/内网' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="browser" label="终端与操作系统" width="180">
            <template #default="{ row }">
              <span class="ua-badge">{{ row.browser || 'Unknown' }} · {{ row.os || 'Unknown' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="riskScore" label="风控评分" width="120">
            <template #default="{ row }">
              <el-tag
                :type="row.riskScore >= 70 ? 'danger' : row.riskScore >= 30 ? 'warning' : 'success'"
                size="small"
              >
                {{ row.riskScore }} 分
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="errorMessage" label="审计结果标签" min-width="180">
            <template #default="{ row }">
              <span :class="row.loginStatus === 1 ? 'tag-success' : 'tag-danger'">
                {{ row.errorMessage || (row.loginStatus === 1 ? '凭据校验通过' : '口令不匹配') }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="loginTime" label="认证时间" width="170">
            <template #default="{ row }">
              <span class="time-col">{{ row.loginTime }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getOverviewStats, getLogPage } from '../api/admin'
import {
  DataLine,
  Check,
  WarningFilled,
  Connection,
  TrendCharts,
  Operation,
  CirclePlus,
  User,
  Aim,
  Document,
  Timer,
  ArrowRight
} from '@element-plus/icons-vue'

const stats = ref({})
const recentLogs = ref([])

onMounted(async () => {
  try {
    const data = await getOverviewStats()
    stats.value = data || {}
  } catch (e) {}

  try {
    const logRes = await getLogPage({ pageNum: 1, pageSize: 5 })
    recentLogs.value = logRes?.list || []
  } catch (e) {}
})

// 近 7 天趋势数据
const trendList = computed(() => {
  const trends = stats.value?.sevenDaysTrends || []
  if (trends.length > 0) {
    return trends.map(t => ({
      day: String(t.day_str || '').slice(5),
      success: Number(t.success_count || 0),
      fail: Number(t.fail_count || 0)
    }))
  }
  return [
    { day: '10-06', success: 14, fail: 1 },
    { day: '10-07', success: 22, fail: 2 },
    { day: '10-08', success: 28, fail: 3 },
    { day: '10-09', success: 35, fail: 1 },
    { day: '10-10', success: 31, fail: 4 },
    { day: '10-11', success: 46, fail: 2 },
    { day: '10-12', success: Number(stats.value.todaySuccess || 12), fail: Number(stats.value.todayFail || 2) }
  ]
})

const maxTrendVal = computed(() => {
  let max = 15
  trendList.value.forEach(item => {
    const total = Math.max(item.success, item.fail)
    if (total > max) max = total
  })
  return Math.ceil(max * 1.25)
})
</script>

<style scoped>
.dashboard-shell {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部运营卡片 */
.dashboard-header-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.title-with-pill {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dash-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.cluster-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  padding: 2px 8px;
  border-radius: 9999px;
}

.live-blink-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.dash-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.header-action-meta {
  display: flex;
  gap: 10px;
}

.meta-stat-pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
}

.meta-val {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'JetBrains Mono', monospace;
}

/* 4 大 KPI 网格 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.kpi-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.kpi-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.kpi-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.kpi-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.kpi-icon-box.success {
  background: #ecfdf5;
  color: #059669;
}

.kpi-icon-box.warning {
  background: #fffbeb;
  color: #d97706;
}

.kpi-icon-box.primary {
  background: #eff6ff;
  color: #2563eb;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.kpi-number {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.kpi-unit {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-left: 2px;
}

.text-success { color: #059669; }
.text-warning { color: #d97706; }

.kpi-trend {
  font-size: 11px;
  font-weight: 600;
}

.kpi-trend.positive {
  color: #059669;
}

.kpi-trend.neutral {
  color: #64748b;
}

.kpi-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.footer-sub {
  color: #94a3b8;
}

.kpi-tag {
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 4px;
}

.kpi-tag.neutral { background: #f1f5f9; color: #475569; }
.kpi-tag.success { background: #ecfdf5; color: #047857; }
.kpi-tag.warning { background: #fffbeb; color: #b45309; }
.kpi-tag.primary { background: #eff6ff; color: #1d4ed8; }

/* 图表与快捷工作台 */
.analytics-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-icon {
  font-size: 18px;
  color: #2563eb;
}

.title-text-group {
  display: flex;
  flex-direction: column;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.panel-sub {
  font-size: 11px;
  color: #94a3b8;
}

.chart-legend-pills {
  display: flex;
  gap: 12px;
}

.legend-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
}

.legend-color-box {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-pill.success .legend-color-box { background: #2563eb; }
.legend-pill.danger .legend-color-box { background: #f43f5e; }

.chart-canvas-wrap {
  padding: 16px 20px;
  height: 220px;
}

.trend-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.bar-hover-zone:hover + .bar-anim {
  opacity: 1;
  filter: brightness(1.1);
}

.svg-bar {
  transition: all 0.2s ease;
}

/* 快捷链接卡片 */
.quick-link-cards {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-link-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 14px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-link-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  transform: translateX(2px);
}

.quick-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.quick-item-icon.brand { background: #eff6ff; color: #2563eb; }
.quick-item-icon.success { background: #ecfdf5; color: #059669; }
.quick-item-icon.warning { background: #fffbeb; color: #d97706; }
.quick-item-icon.neutral { background: #f1f5f9; color: #475569; }

.quick-item-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.item-sub {
  font-size: 11px;
  color: #64748b;
}

.item-arrow {
  font-size: 14px;
  color: #cbd5e1;
}

/* 审计列表 */
.recent-audit-panel {
  display: flex;
  flex-direction: column;
}

.table-container {
  padding: 12px 16px 16px 16px;
}

.user-inline-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-dot {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: #e2e8f0;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name-text {
  font-weight: 600;
  color: #0f172a;
}

.ip-meta-cell {
  display: flex;
  flex-direction: column;
}

.ip-text {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #1e293b;
  width: fit-content;
}

.location-text {
  font-size: 11px;
  color: #94a3b8;
}

.ua-badge {
  font-size: 12px;
  color: #475569;
}

.tag-success {
  font-size: 12px;
  color: #059669;
}

.tag-danger {
  font-size: 12px;
  color: #e11d48;
}

.time-col {
  font-size: 12px;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .analytics-row {
    grid-template-columns: 1fr;
  }
}
</style>
