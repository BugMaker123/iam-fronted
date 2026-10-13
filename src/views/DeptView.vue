<template>
  <div class="dept-container animate-fade-in">
    <!-- 顶部操作条 -->
    <div class="page-action-bar ui-card">
      <div class="filter-inputs">
        <el-select
          v-model="selectedCompanyId"
          placeholder="按公司组织筛选部门树"
          clearable
          style="width: 240px;"
          @change="loadTree"
        >
          <el-option
            v-for="c in companyList"
            :key="c.id"
            :label="c.companyName"
            :value="c.id"
          />
        </el-select>

        <el-button type="primary" @click="loadTree">
          <el-icon><Refresh /></el-icon> 刷新树形结构
        </el-button>
      </div>

      <div class="bar-actions">
        <el-button type="primary" @click="openCreateDialog(null)">
          <el-icon><Plus /></el-icon> 新增顶级部门
        </el-button>
      </div>
    </div>

    <!-- 树形表格卡片 -->
    <div class="table-card ui-card">
      <div class="table-card-header">
        <div class="header-info">
          <span class="table-title">企业部门多级组织树架构</span>
          <span class="table-counter">层级组织关系映射表</span>
        </div>
      </div>

      <el-table
        :data="deptTree"
        v-loading="loading"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
      >
        <el-table-column prop="deptName" label="部门组织名称" min-width="240">
          <template #default="{ row }">
            <div class="dept-name-cell">
              <el-icon class="folder-glyph"><FolderOpened /></el-icon>
              <strong class="dept-title-text">{{ row.deptName }}</strong>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="deptCode" label="部门编码" width="160">
          <template #default="{ row }">
            <span class="code-mono">{{ row.deptCode }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="companyId" label="所属公司" width="180">
          <template #default="{ row }">
            <span class="org-sub-text">{{ getCompanyName(row.companyId) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="leader" label="部门主管" width="130" />
        <el-table-column prop="phone" label="联系分机" width="130">
          <template #default="{ row }">
            <span class="code-mono">{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="sortOrder" label="排序权重" width="90">
          <template #default="{ row }">
            <span class="code-mono">{{ row.sortOrder }}</span>
          </template>
        </el-table-column>

        <el-table-column label="管理操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openCreateDialog(row)">
              <el-icon><Plus /></el-icon> 添加子部门
            </el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 部门新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑部门架构节点' : '新增组织部门'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="dialogFormRef" :model="currentDept" :rules="deptRules" label-width="100px" class="dialog-form">
        <el-form-item label="所属公司" prop="companyId">
          <el-select v-model="currentDept.companyId" placeholder="请选择所属法人公司" style="width: 100%;">
            <el-option
              v-for="c in companyList"
              :key="c.id"
              :label="c.companyName"
              :value="c.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="上级部门">
          <el-select v-model="currentDept.parentId" placeholder="留空则作为顶级部门" clearable style="width: 100%;">
            <el-option :value="0" label="-- 顶级部门 (Root) --" />
            <el-option
              v-for="d in flatDeptList"
              :key="d.id"
              :label="d.deptName"
              :value="d.id"
              :disabled="d.id === currentDept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="currentDept.deptName" placeholder="例如: 信息安全与风控部" />
        </el-form-item>

        <el-form-item label="部门编码" prop="deptCode">
          <el-input v-model="currentDept.deptCode" placeholder="例如: SEC_RISK_DEPT" />
        </el-form-item>

        <el-form-item label="负责人" prop="leader">
          <el-input v-model="currentDept.leader" placeholder="例如: 赵主管" />
        </el-form-item>

        <el-form-item label="联系分机" prop="phone">
          <el-input v-model="currentDept.phone" placeholder="例如: 021-8899" />
        </el-form-item>

        <el-form-item label="排序权重">
          <el-input-number v-model="currentDept.sortOrder" :min="0" :max="999" />
        </el-form-item>

        <el-form-item label="部门状态">
          <el-switch
            v-model="currentDept.status"
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveDeptForm">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getDeptTree, getDeptFlatList, createDept, updateDept, deleteDept, getAllCompanies } from '../api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, FolderOpened } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const selectedCompanyId = ref(null)
const companyList = ref([])
const deptTree = ref([])
const flatDeptList = ref([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const dialogFormRef = ref(null)

const currentDept = reactive({
  id: null,
  companyId: null,
  parentId: 0,
  deptName: '',
  deptCode: '',
  leader: '',
  phone: '',
  sortOrder: 1,
  status: 1
})

const deptRules = {
  companyId: [{ required: true, message: '请选择所属公司', trigger: 'change' }],
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  deptCode: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
}

onMounted(async () => {
  try {
    const comps = await getAllCompanies()
    companyList.value = comps || []
  } catch (e) {}
  loadTree()
})

const loadTree = async () => {
  loading.value = true
  try {
    const tree = await getDeptTree(selectedCompanyId.value)
    deptTree.value = tree || []
    const flat = await getDeptFlatList()
    flatDeptList.value = flat || []
  } finally {
    loading.value = false
  }
}

const getCompanyName = (cid) => {
  const c = companyList.value.find(item => item.id === cid)
  return c ? c.companyName : (cid ? `公司#${cid}` : '未指定')
}

const openCreateDialog = (parentRow) => {
  isEdit.value = false
  Object.assign(currentDept, {
    id: null,
    companyId: parentRow ? parentRow.companyId : (selectedCompanyId.value || companyList.value[0]?.id || null),
    parentId: parentRow ? parentRow.id : 0,
    deptName: '',
    deptCode: '',
    leader: '',
    phone: '',
    sortOrder: 1,
    status: 1
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(currentDept, row)
  dialogVisible.value = true
}

const saveDeptForm = async () => {
  if (!dialogFormRef.value) return
  await dialogFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (isEdit.value) {
        await updateDept(currentDept)
        ElMessage.success('部门节点更新成功')
      } else {
        await createDept(currentDept)
        ElMessage.success('新部门创建成功')
      }
      dialogVisible.value = false
      loadTree()
    } finally {
      saving.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要移除部门 [${row.deptName}] 吗？请确保该部门下无子部门及归属人员！`, '删除确认', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    await deleteDept(row.id)
    ElMessage.success('部门节点已移除')
    loadTree()
  }).catch(() => {})
}
</script>

<style scoped>
.dept-container {
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

.dept-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.folder-glyph {
  font-size: 16px;
  color: #2563eb;
}

.dept-title-text {
  font-weight: 600;
  color: #0f172a;
}

.code-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #475569;
}

.org-sub-text {
  font-size: 12px;
  color: #64748b;
}

.dialog-form {
  padding: 4px 10px;
}
</style>
