<template>
  <div class="users-container animate-fade-in">
    <!-- 顶部操作条 -->
    <div class="page-action-bar ui-card">
      <div class="filter-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索账号 / 真实姓名 / 手机 / 邮箱"
          clearable
          style="width: 270px;"
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="账号状态"
          clearable
          style="width: 120px;"
          @change="loadData"
        >
          <el-option label="正常启用" :value="1" />
          <el-option label="已禁用" :value="0" />
          <el-option label="风控锁定" :value="2" />
        </el-select>

        <el-select
          v-model="riskFilter"
          placeholder="风控等级"
          clearable
          style="width: 130px;"
          @change="loadData"
        >
          <el-option label="低风险 (LOW)" value="LOW" />
          <el-option label="中风险 (MEDIUM)" value="MEDIUM" />
          <el-option label="高风险 (HIGH)" value="HIGH" />
        </el-select>

        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon> 筛选人员
        </el-button>
      </div>

      <div class="bar-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon> 新增人员账号
        </el-button>
      </div>
    </div>

    <!-- 用户数据列表 -->
    <div class="table-card ui-card">
      <div class="table-card-header">
        <div class="header-info">
          <span class="table-title">企业人员与统一身份账号名录</span>
          <span class="table-counter">共 {{ total }} 位纳管用户</span>
        </div>
      </div>

      <el-table :data="userList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="username" label="登录账号" width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="user-avatar-dot">{{ (row.realName || row.username).charAt(0) }}</span>
              <div class="user-cell-meta">
                <span class="username-text">{{ row.username }}</span>
                <span v-if="row.role === 'ADMIN'" class="role-pill admin">ADMIN</span>
                <span v-else class="role-pill user">USER</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="realName" label="真实姓名" width="130">
          <template #default="{ row }">
            <span class="name-text">{{ row.realName || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号码" width="130">
          <template #default="{ row }">
            <span class="mono-text">{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="email" label="电子邮箱" min-width="170">
          <template #default="{ row }">
            <span class="mono-text">{{ row.email || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="companyId" label="所属公司" width="160">
          <template #default="{ row }">
            <span class="org-text">{{ getCompanyName(row.companyId) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="deptId" label="所属部门" width="150">
          <template #default="{ row }">
            <span class="org-text">{{ getDeptName(row.deptId) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 0 ? 'info' : 'danger'" size="small">
              {{ row.status === 1 ? '正常' : row.status === 0 ? '已禁用' : '已锁定' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="riskLevel" label="风控等级" width="110">
          <template #default="{ row }">
            <el-tag
              :type="row.riskLevel === 'HIGH' ? 'danger' : row.riskLevel === 'MEDIUM' ? 'warning' : 'success'"
              size="small"
            >
              {{ row.riskLevel || 'LOW' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="lastLoginTime" label="最后登录" width="160">
          <template #default="{ row }">
            <span class="time-text">{{ row.lastLoginTime || '尚未登录' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="管理操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="warning" size="small" @click="handleResetPassword(row)">重置口令</el-button>
            <el-button
              link
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑人员账号画像' : '创建新企业员工账号'"
      width="580px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="currentUser" :rules="userRules" label-width="100px" class="dialog-form">
        <el-form-item label="登录账号" prop="username">
          <el-input v-model="currentUser.username" placeholder="请输入工号或账号英文名 (例如 sinopharm_01)" :disabled="isEdit" />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="初始密码" prop="password">
          <el-input v-model="currentUser.password" type="password" placeholder="留空则初始默认口令为 admin" show-password />
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="currentUser.realName" placeholder="例如: 张三" />
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="currentUser.phone" placeholder="例如: 13800000000" />
        </el-form-item>

        <el-form-item label="工作邮箱" prop="email">
          <el-input v-model="currentUser.email" placeholder="例如: zhangsan@sinopharm.com" />
        </el-form-item>

        <el-form-item label="所属公司" prop="companyId">
          <el-select v-model="currentUser.companyId" placeholder="选择所属组织公司" style="width: 100%;">
            <el-option
              v-for="c in companyOptions"
              :key="c.id"
              :label="c.companyName"
              :value="c.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-select v-model="currentUser.deptId" placeholder="选择所属组织架构部门" style="width: 100%;">
            <el-option
              v-for="d in deptOptions"
              :key="d.id"
              :label="d.deptName"
              :value="d.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色权限" prop="role">
          <el-radio-group v-model="currentUser.role">
            <el-radio label="USER">普通员工 (USER)</el-radio>
            <el-radio label="ADMIN">系统管理员 (ADMIN)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="风控等级" prop="riskLevel">
          <el-radio-group v-model="currentUser.riskLevel">
            <el-radio label="LOW">正常低风险 (LOW)</el-radio>
            <el-radio label="MEDIUM">中度关注 (MEDIUM)</el-radio>
            <el-radio label="HIGH">高危受控 (HIGH)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="账号状态">
          <el-radio-group v-model="currentUser.status">
            <el-radio :label="1">正常启用</el-radio>
            <el-radio :label="0">管理员禁用</el-radio>
            <el-radio :label="2">风控自动锁定</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveUserForm">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  getUserPage,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  updateUserStatus,
  getAllCompanies,
  getDeptFlatList
} from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const userList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const searchKeyword = ref('')
const statusFilter = ref('')
const riskFilter = ref('')

const companyOptions = ref([])
const deptOptions = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogFormRef = ref(null)

const currentUser = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  phone: '',
  email: '',
  companyId: null,
  deptId: null,
  role: 'USER',
  status: 1,
  riskLevel: 'LOW'
})

const userRules = {
  username: [{ required: true, message: '请输入账号或工号', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }]
}

onMounted(async () => {
  try {
    const compRes = await getAllCompanies()
    companyOptions.value = compRes || []
  } catch (e) {}

  try {
    const deptRes = await getDeptFlatList()
    deptOptions.value = deptRes || []
  } catch (e) {}

  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getUserPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value !== '' ? statusFilter.value : undefined,
      riskLevel: riskFilter.value || undefined
    })
    userList.value = res?.list || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

const getCompanyName = (cid) => {
  const c = companyOptions.value.find(item => item.id === cid)
  return c ? c.companyName : (cid ? `公司#${cid}` : '未指定')
}

const getDeptName = (did) => {
  const d = deptOptions.value.find(item => item.id === did)
  return d ? d.deptName : (did ? `部门#${did}` : '未指定')
}

const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(currentUser, {
    id: null,
    username: '',
    password: '',
    realName: '',
    phone: '',
    email: '',
    companyId: companyOptions.value[0]?.id || null,
    deptId: deptOptions.value[0]?.id || null,
    role: 'USER',
    status: 1,
    riskLevel: 'LOW'
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(currentUser, row)
  currentUser.password = ''
  dialogVisible.value = true
}

const saveUserForm = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await updateUser(currentUser)
        ElMessage.success('人员信息更新成功')
      } else {
        await createUser(currentUser)
        ElMessage.success('新账号创建成功 (默认口令: admin)')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

const handleResetPassword = (row) => {
  ElMessageBox.prompt(`请输入重置后的密码（留空则默认口令为 admin）:`, `重置 [${row.username}] 登录口令`, {
    confirmButtonText: '确定重置',
    cancelButtonText: '取消',
    inputPlaceholder: 'admin'
  }).then(async ({ value }) => {
    const pwd = value || 'admin'
    await resetUserPassword(row.id, pwd)
    ElMessage.success(`口令已成功重置为: ${pwd} (已加盐加密)`)
  }).catch(() => {})
}

const toggleStatus = async (row) => {
  const nextStatus = row.status === 1 ? 0 : 1
  await updateUserStatus(row.id, nextStatus)
  ElMessage.success(nextStatus === 1 ? '账号已启用' : '账号已禁用')
  loadData()
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要移除人员账号 [${row.username}] 吗？此操作将注销该员工在所有系统的凭证！`, '注销确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    await deleteUser(row.id)
    ElMessage.success('账号已移除')
    loadData()
  }).catch(() => {})
}
</script>

<style scoped>
.users-container {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar-dot {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-cell-meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.username-text {
  font-weight: 600;
  color: #0f172a;
  font-size: 13px;
}

.role-pill {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
}

.role-pill.admin {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.role-pill.user {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.name-text {
  color: #1e293b;
  font-weight: 500;
}

.mono-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #475569;
}

.org-text {
  font-size: 12px;
  color: #475569;
}

.time-text {
  font-size: 11px;
  color: #64748b;
  font-family: 'JetBrains Mono', monospace;
}

.table-pagination-footer {
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f1f5f9;
}

.dialog-form {
  padding: 4px 10px;
}
</style>
