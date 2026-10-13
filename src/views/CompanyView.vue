<template>
  <div class="company-container animate-fade-in">
    <!-- 顶部操作条 -->
    <div class="page-action-bar ui-card">
      <div class="filter-inputs">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索公司名称 / 组织编码"
          clearable
          style="width: 280px;"
          @clear="loadData"
          @keyup.enter="loadData"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select
          v-model="statusFilter"
          placeholder="组织状态"
          clearable
          style="width: 130px;"
          @change="loadData"
        >
          <el-option label="正常启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>

        <el-button type="primary" @click="loadData">
          <el-icon><Search /></el-icon> 筛选组织
        </el-button>
      </div>

      <div class="bar-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon> 新增公司组织
        </el-button>
      </div>
    </div>

    <!-- 公司列表卡片 -->
    <div class="table-card ui-card">
      <div class="table-card-header">
        <div class="header-info">
          <span class="table-title">集团与分子公司组织机构名录</span>
          <span class="table-counter">共 {{ total }} 家法人/分支机构</span>
        </div>
      </div>

      <el-table :data="companyList" v-loading="loading" stripe style="width: 100%">
        <el-table-column prop="companyCode" label="组织编码" width="160">
          <template #default="{ row }">
            <span class="code-mono">{{ row.companyCode }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="companyName" label="公司组织全称" min-width="220">
          <template #default="{ row }">
            <div class="company-name-cell">
              <span class="company-icon-dot"><el-icon><OfficeBuilding /></el-icon></span>
              <strong class="name-text">{{ row.companyName }}</strong>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="leader" label="组织负责人" width="130" />
        <el-table-column prop="phone" label="联系电话" width="140">
          <template #default="{ row }">
            <span class="code-mono">{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="联系邮箱" min-width="180">
          <template #default="{ row }">
            <span class="code-mono">{{ row.email || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常启用' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序权重" width="100">
          <template #default="{ row }">
            <span class="code-mono">{{ row.sortOrder }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="remark" label="组织说明" min-width="160">
          <template #default="{ row }">
            <span class="remark-text">{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="管理操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
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

    <!-- 公司新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑公司组织信息' : '创建新公司组织'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="currentCompany" :rules="companyRules" label-width="100px" class="dialog-form">
        <el-form-item label="组织编码" prop="companyCode">
          <el-input v-model="currentCompany.companyCode" placeholder="例如: GK_SHANGHAI" :disabled="isEdit" />
        </el-form-item>

        <el-form-item label="公司全称" prop="companyName">
          <el-input v-model="currentCompany.companyName" placeholder="例如: 宇宙中心上海生物医药有限公司" />
        </el-form-item>

        <el-form-item label="负责人" prop="leader">
          <el-input v-model="currentCompany.leader" placeholder="例如: 张主管" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="currentCompany.phone" placeholder="例如: 021-23018888" />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="email">
          <el-input v-model="currentCompany.email" placeholder="例如: contact@sinopharm.com" />
        </el-form-item>

        <el-form-item label="排序权重">
          <el-input-number v-model="currentCompany.sortOrder" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="组织状态">
          <el-switch
            v-model="currentCompany.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>

        <el-form-item label="备注说明">
          <el-input v-model="currentCompany.remark" type="textarea" :rows="2" placeholder="填写组织业务说明" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveCompanyForm">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCompanyPage, createCompany, updateCompany, deleteCompany } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, OfficeBuilding } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const companyList = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const searchKeyword = ref('')
const statusFilter = ref('')

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogFormRef = ref(null)

const currentCompany = reactive({
  id: null,
  companyCode: '',
  companyName: '',
  leader: '',
  phone: '',
  email: '',
  status: 1,
  sortOrder: 1,
  remark: ''
})

const companyRules = {
  companyCode: [{ required: true, message: '请输入公司编码', trigger: 'blur' }],
  companyName: [{ required: true, message: '请输入公司全称', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCompanyPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      status: statusFilter.value !== '' ? statusFilter.value : undefined
    })
    companyList.value = res?.list || []
    total.value = res?.total || 0
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  Object.assign(currentCompany, {
    id: null,
    companyCode: '',
    companyName: '',
    leader: '',
    phone: '',
    email: '',
    status: 1,
    sortOrder: 1,
    remark: ''
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(currentCompany, row)
  dialogVisible.value = true
}

const saveCompanyForm = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await updateCompany(currentCompany)
        ElMessage.success('公司信息已更新')
      } else {
        await createCompany(currentCompany)
        ElMessage.success('新公司组织创建成功')
      }
      dialogVisible.value = false
      loadData()
    } finally {
      saving.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要移除公司组织 [${row.companyName}] 吗？请确保该组织下无关联账号！`, '删除确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    await deleteCompany(row.id)
    ElMessage.success('公司组织已移除')
    loadData()
  }).catch(() => {})
}
</script>

<style scoped>
.company-container {
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

.company-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.company-icon-dot {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.name-text {
  color: #0f172a;
  font-weight: 600;
}

.code-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #475569;
}

.remark-text {
  font-size: 12px;
  color: #64748b;
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
