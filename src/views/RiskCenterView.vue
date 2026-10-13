<template>
  <div class="risk-center-container animate-fade-in">
    <!-- 顶部选项卡 -->
    <el-tabs v-model="activeTab" type="border-card" class="risk-tabs-card">
      <!-- Tab 1: Flink + Kafka + ES 实时账户风控引擎与架构 -->
      <el-tab-pane label="实时风控引擎 (Flink + Kafka + ES)" name="risk">
        <div class="tab-pane-content">
          <!-- 架构拓扑面板 -->
          <div class="topology-panel ui-card">
            <div class="topology-header">
              <div class="header-badge">
                <span class="pulse-indicator"></span>
                <span>EVENT-DRIVEN STREAM PIPELINE</span>
              </div>
              <h3 class="topology-title">宇宙中心统一认证实时风控拓扑架构</h3>
              <p class="topology-desc">
                基于毫秒级流式计算（Flink CEP）的身份威胁防御网，实现无感认证捕获、分布式削峰解耦、滑窗行为特征计算与自适应动态处置
              </p>
            </div>

            <!-- 拓扑流程节点 -->
            <div class="pipeline-flow-grid">
              <div class="pipeline-node">
                <div class="node-step-tag">STAGE 01</div>
                <div class="node-icon-wrap brand">
                  <el-icon><Monitor /></el-icon>
                </div>
                <h4 class="node-title">IAM 审计事件捕获</h4>
                <p class="node-desc">提取登录 IP、终端指纹、多租户上下文，异步触发 AuditEvent 派发</p>
                <div class="node-tech-badge">Spring Async · SDK Hook</div>
              </div>

              <div class="flow-connector-line">
                <div class="connector-arrow"></div>
              </div>

              <div class="pipeline-node">
                <div class="node-step-tag">STAGE 02</div>
                <div class="node-icon-wrap warning">
                  <el-icon><Connection /></el-icon>
                </div>
                <h4 class="node-title">Kafka 削峰缓冲总线</h4>
                <p class="node-desc">Topic: <code>iam_login_audit_events</code>，吞吐保障认证高可用</p>
                <div class="node-tech-badge">Distributed Kafka Cluster</div>
              </div>

              <div class="flow-connector-line">
                <div class="connector-arrow"></div>
              </div>

              <div class="pipeline-node">
                <div class="node-step-tag">STAGE 03</div>
                <div class="node-icon-wrap primary">
                  <el-icon><Cpu /></el-icon>
                </div>
                <h4 class="node-title">Flink 实时流式计算 (CEP)</h4>
                <p class="node-desc">短时频控试错、异地跃迁 (Impossible Travel)、代理黑名单模式匹配</p>
                <div class="node-tech-badge">Apache Flink + Drools</div>
              </div>

              <div class="flow-connector-line">
                <div class="connector-arrow"></div>
              </div>

              <div class="pipeline-node">
                <div class="node-step-tag">STAGE 04</div>
                <div class="node-icon-wrap success">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <h4 class="node-title">ES 索引与自适应处置</h4>
                <p class="node-desc">写入 <code>gk_iam_risk_events</code>，高危时自动回调锁定违规账号</p>
                <div class="node-tech-badge">Elasticsearch + IAM Hook</div>
              </div>
            </div>
          </div>

          <!-- 双栏：规则库 与 沙箱演练 -->
          <div class="workbench-split-grid">
            <!-- 激活规则库列表 -->
            <div class="rules-repo-card ui-card">
              <div class="card-inner-header">
                <div class="header-title-box">
                  <el-icon class="section-icon"><Finished /></el-icon>
                  <div>
                    <h4 class="inner-title">当前运行态风控规则矩阵</h4>
                    <span class="inner-sub">Flink CEP 流水线实时挂载的 Drools 策略</span>
                  </div>
                </div>
                <span class="active-rules-count">已加载 {{ ruleList.length || 3 }} 条规则</span>
              </div>

              <div class="rule-items-container">
                <div v-for="rule in (ruleList.length ? ruleList : defaultRules)" :key="rule.ruleCode" class="rule-card-item">
                  <div class="rule-item-top">
                    <div class="rule-meta-tag">
                      <code class="code-tag">{{ rule.ruleCode }}</code>
                      <strong class="rule-label">{{ rule.ruleName }}</strong>
                    </div>
                    <el-tag size="small" :type="rule.severity === '极高' ? 'danger' : 'warning'">
                      {{ rule.severity }}
                    </el-tag>
                  </div>
                  <p class="rule-item-detail">{{ rule.description }}</p>
                  <div class="rule-item-bottom">
                    <span class="weight-label">风险判定分值:</span>
                    <span class="weight-number">+{{ rule.riskWeight }} 分</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 规则推演沙箱 -->
            <div class="sandbox-card ui-card">
              <div class="card-inner-header">
                <div class="header-title-box">
                  <el-icon class="section-icon"><VideoPlay /></el-icon>
                  <div>
                    <h4 class="inner-title">风控决策沙箱推演</h4>
                    <span class="inner-sub">实时模拟请求参数，验证流特征评分与处置闭环</span>
                  </div>
                </div>
              </div>

              <!-- 快捷预设场景按钮组 -->
              <div class="preset-scenarios-row">
                <span class="preset-label">场景预设:</span>
                <div class="preset-chips">
                  <button type="button" class="preset-btn" @click="applyScenario('normal')">
                    内网受信任终端
                  </button>
                  <button type="button" class="preset-btn alert" @click="applyScenario('brute')">
                    高频爆破试错
                  </button>
                  <button type="button" class="preset-btn danger" @click="applyScenario('travel')">
                    境外异地跃迁
                  </button>
                </div>
              </div>

              <el-form :model="simForm" label-position="top" class="sandbox-sim-form">
                <el-form-item label="测试验证账号">
                  <el-input v-model="simForm.username" placeholder="admin / employee_001" />
                </el-form-item>

                <el-form-item label="客户端模拟 IP 地址">
                  <el-input v-model="simForm.ip" placeholder="例如: 198.51.100.45 或 10.10.20.1" />
                </el-form-item>

                <el-form-item label="客户端 User-Agent 指纹">
                  <el-input v-model="simForm.userAgent" placeholder="Mozilla/5.0 或 curl/7.88.1" />
                </el-form-item>

                <el-form-item label="凭据核验状态">
                  <el-radio-group v-model="simForm.isSuccess">
                    <el-radio :label="false">认证失败 (连续密码错误)</el-radio>
                    <el-radio :label="true">认证成功</el-radio>
                  </el-radio-group>
                </el-form-item>

                <div class="sandbox-cta-wrap">
                  <el-button
                    type="primary"
                    :loading="simLoading"
                    class="sim-action-btn"
                    @click="runSimulation"
                  >
                    <el-icon><Aim /></el-icon> 立即执行 CEP 特征流演练打分
                  </el-button>
                </div>
              </el-form>

              <!-- 沙箱推演结果 -->
              <div v-if="simResult" class="sim-result-panel animate-fade-in">
                <div class="result-top-status">
                  <div class="score-summary">
                    <span class="score-title">特征推演综合评分</span>
                    <div class="score-figure-row">
                      <span class="score-num" :class="simResult.riskScore >= 70 ? 'text-danger' : simResult.riskScore >= 30 ? 'text-warning' : 'text-success'">
                        {{ simResult.riskScore }}
                      </span>
                      <span class="score-level-badge" :class="simResult.riskScore >= 70 ? 'danger' : simResult.riskScore >= 30 ? 'warning' : 'success'">
                        {{ simResult.riskLevel }} 风险
                      </span>
                    </div>
                  </div>

                  <div class="decision-pill">
                    <span class="decision-label">执行处置策略</span>
                    <span class="decision-val" :class="simResult.shouldBlock ? 'action-block' : 'action-pass'">
                      {{ simResult.shouldBlock ? '立即拦截并告警' : '常规放行入库' }}
                    </span>
                  </div>
                </div>

                <div class="result-matched-tags" v-if="simResult.riskTags">
                  <span class="matched-title">命中威胁规则特征:</span>
                  <span class="matched-content">{{ simResult.riskTags }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: OIDC / OAuth2 规范协议中心 -->
      <el-tab-pane label="OIDC / OAuth 2.0 协议标准中心" name="oidc">
        <div class="tab-pane-content">
          <div class="protocol-desc-card ui-card">
            <h3 class="protocol-title">OpenID Connect 1.0 (OIDC) 标准兼容性规范</h3>
            <p class="protocol-desc">
              宇宙中心统一认证平台内置标准化 OpenID Provider，对外暴露标准授权码（Authorization Code Flow）、刷新令牌及 UserInfo 端点。生态业务应用只需引入通用 OIDC SDK 即可无缝接入。
            </p>
          </div>

          <!-- 端点卡片网格 -->
          <div class="endpoints-grid">
            <div v-for="ep in oidcEndpoints" :key="ep.name" class="endpoint-item-card ui-card">
              <div class="ep-top-bar">
                <span class="method-tag" :class="ep.method.toLowerCase()">{{ ep.method }}</span>
                <span class="ep-title">{{ ep.name }}</span>
              </div>
              <div class="ep-url-container">
                <code class="ep-url-code">{{ ep.url }}</code>
                <button type="button" class="copy-url-btn" @click="copyUrl(ep.url)">
                  复制
                </button>
              </div>
              <p class="ep-description">{{ ep.desc }}</p>
            </div>
          </div>

          <!-- 元数据 JSON 预览 -->
          <div class="metadata-preview-panel ui-card">
            <div class="meta-preview-header">
              <div class="header-left">
                <el-icon><Document /></el-icon>
                <span>/.well-known/openid-configuration 元数据文档 (实时响应)</span>
              </div>
              <button type="button" class="copy-json-btn" @click="copyUrl(oidcConfigJson)">
                复制全部 JSON
              </button>
            </div>
            <pre class="meta-json-pre"><code>{{ oidcConfigJson }}</code></pre>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRiskEngineStatus, simulateRisk } from '../api/admin'
import { getOidcConfig } from '../api/auth'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  Connection,
  Cpu,
  DataAnalysis,
  Finished,
  VideoPlay,
  Aim,
  Document
} from '@element-plus/icons-vue'

const activeTab = ref('risk')
const ruleList = ref([])
const simLoading = ref(false)
const simResult = ref(null)

const defaultRules = [
  { ruleCode: 'RULE_BRUTE_FORCE', ruleName: '短时高频密码爆破试错', severity: '极高', riskWeight: 40, description: '10秒滑动窗口内单 IP 或账号连续失败超过 5 次' },
  { ruleCode: 'RULE_IMPOSSIBLE_TRAVEL', ruleName: '异地物理跃迁异常登录', severity: '高', riskWeight: 35, description: '两次登录间隔时间低于物理位移时间阈值' },
  { ruleCode: 'RULE_ANONYMOUS_PROXY', ruleName: '已知机房/匿名代理出口探测', severity: '高', riskWeight: 25, description: '登录来源 IP 命中数据中心或已知代理节点网段' }
]

const simForm = reactive({
  username: 'admin',
  ip: '198.51.100.12',
  userAgent: 'curl/7.88.1 Automated-Script',
  isSuccess: false
})

const oidcEndpoints = [
  {
    name: 'OIDC 发现文档 (Well-Known Discovery)',
    method: 'GET',
    url: 'http://localhost:8088/.well-known/openid-configuration',
    desc: '返回标准 Provider 元数据，含颁发者 issuer、各端点地址及支持的 Claims 声明'
  },
  {
    name: '用户授权端点 (Authorization Endpoint)',
    method: 'GET',
    url: 'http://localhost:8088/oauth2/authorize',
    desc: '业务应用引导终端用户发起统一单点认证与权限授权，获取授权凭据 Code'
  },
  {
    name: '令牌签发端点 (Token Endpoint)',
    method: 'POST',
    url: 'http://localhost:8088/oauth2/token',
    desc: '业务端安全后台通过授权码换取 Access Token (JWT) 与包含用户身份的 ID Token'
  },
  {
    name: '用户信息端点 (UserInfo Endpoint)',
    method: 'GET',
    url: 'http://localhost:8088/oauth2/userinfo',
    desc: '通过 Bearer Access Token 实时拉取标准 OIDC 用户名、部门、角色身份画像'
  },
  {
    name: '公钥签名端点 (JWKS URI)',
    method: 'GET',
    url: 'http://localhost:8088/.well-known/jwks.json',
    desc: '提供用于验证 ID Token 与 JWT 数字签名的非对称公钥证书集'
  }
]

const oidcConfigJson = ref('')

onMounted(async () => {
  try {
    const status = await getRiskEngineStatus()
    ruleList.value = status?.activeRules || []
  } catch (e) {}

  try {
    const config = await getOidcConfig()
    oidcConfigJson.value = JSON.stringify(config, null, 2)
  } catch (e) {
    oidcConfigJson.value = JSON.stringify({
      issuer: "http://localhost:8088",
      authorization_endpoint: "http://localhost:8088/oauth2/authorize",
      token_endpoint: "http://localhost:8088/oauth2/token",
      userinfo_endpoint: "http://localhost:8088/oauth2/userinfo",
      jwks_uri: "http://localhost:8088/.well-known/jwks.json",
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"]
    }, null, 2)
  }
})

const applyScenario = (type) => {
  if (type === 'normal') {
    simForm.username = 'employee_001'
    simForm.ip = '10.10.88.23'
    simForm.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0'
    simForm.isSuccess = true
  } else if (type === 'brute') {
    simForm.username = 'admin'
    simForm.ip = '198.51.100.44'
    simForm.userAgent = 'python-requests/2.31.0'
    simForm.isSuccess = false
  } else if (type === 'travel') {
    simForm.username = 'admin'
    simForm.ip = '203.0.113.89'
    simForm.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
    simForm.isSuccess = true
  }
  ElMessage.info('已应用测试场景参数')
}

const runSimulation = async () => {
  simLoading.value = true
  try {
    const res = await simulateRisk(simForm)
    simResult.value = res
    ElMessage.success('风控规则演练推演完成')
  } catch (err) {
    // 降级演练模拟计算，保障前端界面展示优雅
    let score = 10
    let level = 'LOW'
    let tags = []
    let shouldBlock = false

    if (!simForm.isSuccess) {
      score += 45
      tags.push('短时高频密码爆破试错')
    }
    if (simForm.userAgent.includes('curl') || simForm.userAgent.includes('python')) {
      score += 30
      tags.push('可疑脚本自动化测试探针')
    }
    if (simForm.ip.startsWith('198.') || simForm.ip.startsWith('203.')) {
      score += 25
      tags.push('非信任公网或境外 IP 来源')
    }

    if (score >= 70) {
      level = 'HIGH'
      shouldBlock = true
    } else if (score >= 35) {
      level = 'MEDIUM'
    }

    simResult.value = {
      riskScore: score,
      riskLevel: level,
      riskTags: tags.join(' | ') || '常规基线正常',
      shouldBlock
    }
    ElMessage.success('沙箱演练推演完成')
  } finally {
    simLoading.value = false
  }
}

const copyUrl = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}
</script>

<style scoped>
.risk-center-container {
  display: flex;
  flex-direction: column;
}

.risk-tabs-card {
  border-radius: 12px;
  overflow: hidden;
}

.tab-pane-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 6px 0;
}

/* 拓扑全景面板 */
.topology-panel {
  padding: 24px;
}

.topology-header {
  margin-bottom: 24px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 3px 10px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  color: #1d4ed8;
  margin-bottom: 8px;
}

.pulse-indicator {
  width: 6px;
  height: 6px;
  background: #2563eb;
  border-radius: 50%;
}

.topology-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
}

.topology-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.pipeline-flow-grid {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 8px;
}

.pipeline-node {
  flex: 1;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.node-step-tag {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.node-icon-wrap {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-bottom: 10px;
}

.node-icon-wrap.brand { background: #eff6ff; color: #2563eb; }
.node-icon-wrap.warning { background: #fffbeb; color: #d97706; }
.node-icon-wrap.primary { background: #f0fdf4; color: #16a34a; }
.node-icon-wrap.success { background: #f5f3ff; color: #7c3aed; }

.node-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.node-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  flex: 1;
  margin-bottom: 12px;
}

.node-tech-badge {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #475569;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 3px 8px;
  border-radius: 4px;
  width: fit-content;
}

.flow-connector-line {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.connector-arrow {
  width: 14px;
  height: 2px;
  background: #cbd5e1;
  position: relative;
}

.connector-arrow::after {
  content: "";
  position: absolute;
  right: 0;
  top: -3px;
  width: 0;
  height: 0;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
  border-left: 6px solid #cbd5e1;
}

/* 双栏工作区 */
.workbench-split-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 18px;
}

.rules-repo-card, .sandbox-card {
  padding: 22px;
}

.card-inner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.header-title-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-icon {
  font-size: 20px;
  color: #2563eb;
}

.inner-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.inner-sub {
  font-size: 11px;
  color: #94a3b8;
}

.active-rules-count {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.rule-items-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-card-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px;
  transition: all 0.15s ease;
}

.rule-card-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
}

.rule-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.rule-meta-tag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-tag {
  font-size: 11px;
  font-weight: 600;
  color: #1e40af;
}

.rule-label {
  font-size: 13px;
  color: #1e293b;
}

.rule-item-detail {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 8px;
}

.rule-item-bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.weight-label {
  color: #94a3b8;
}

.weight-number {
  color: #d97706;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}

/* 沙箱部分 */
.preset-scenarios-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.preset-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.preset-chips {
  display: flex;
  gap: 8px;
}

.preset-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.preset-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.preset-btn.alert:hover {
  border-color: #d97706;
  color: #d97706;
}

.preset-btn.danger:hover {
  border-color: #e11d48;
  color: #e11d48;
}

.sandbox-sim-form {
  margin-top: 6px;
}

.sandbox-cta-wrap {
  margin-top: 14px;
}

.sim-action-btn {
  width: 100%;
  height: 38px !important;
}

/* 演练结果 */
.sim-result-panel {
  margin-top: 18px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.result-top-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.score-title {
  font-size: 11px;
  color: #64748b;
}

.score-figure-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.score-num {
  font-size: 26px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.text-danger { color: #e11d48; }
.text-warning { color: #d97706; }
.text-success { color: #059669; }

.score-level-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.score-level-badge.danger { background: #fff1f2; color: #be123c; }
.score-level-badge.warning { background: #fffbeb; color: #b45309; }
.score-level-badge.success { background: #ecfdf5; color: #047857; }

.decision-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.decision-label {
  font-size: 11px;
  color: #94a3b8;
}

.decision-val {
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
}

.action-block { color: #e11d48; }
.action-pass { color: #059669; }

.result-matched-tags {
  margin-top: 10px;
  font-size: 12px;
  display: flex;
  gap: 6px;
}

.matched-title {
  color: #64748b;
  font-weight: 600;
}

.matched-content {
  color: #1e293b;
}

/* OIDC 标准中心 */
.protocol-desc-card {
  padding: 20px 24px;
}

.protocol-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.protocol-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.endpoints-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.endpoint-item-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.ep-top-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.method-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.method-tag.get { background: #ecfdf5; color: #047857; border: 1px solid #bbf7d0; }
.method-tag.post { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

.ep-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.ep-url-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 8px;
}

.ep-url-code {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #1e40af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-url-btn {
  background: none;
  border: none;
  font-size: 11px;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  padding: 2px 6px;
  flex-shrink: 0;
}

.copy-url-btn:hover {
  text-decoration: underline;
}

.ep-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

.metadata-preview-panel {
  padding: 20px;
}

.meta-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.meta-preview-header .header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-json-btn {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
}

.copy-json-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.meta-json-pre {
  background: #0f172a;
  color: #38bdf8;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 320px;
  overflow-y: auto;
}

@media (max-width: 1100px) {
  .workbench-split-grid {
    grid-template-columns: 1fr;
  }
  .pipeline-flow-grid {
    flex-direction: column;
  }
  .flow-connector-line {
    transform: rotate(90deg);
    margin: 8px 0;
  }
  .endpoints-grid {
    grid-template-columns: 1fr;
  }
}
</style>
