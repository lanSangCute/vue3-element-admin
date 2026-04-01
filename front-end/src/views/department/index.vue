<template>
  <div class="department-management">
    <el-card shadow="never">
      <!-- Search Bar -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('dept.deptCode')">
          <el-input v-model="searchForm.deptCode" :placeholder="$t('dept.deptCode')" clearable />
        </el-form-item>
        <el-form-item :label="$t('dept.deptName')">
          <el-input v-model="searchForm.deptName" :placeholder="$t('dept.deptName')" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            {{ $t('common.search') }}
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            {{ $t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- Action Bar -->
      <div class="action-bar">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          {{ $t('dept.add') }}
        </el-button>
      </div>

      <!-- Department Tree Table -->
      <el-table
        v-loading="loading"
        :data="filteredDepartments"
        border
        stripe
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="deptCode" :label="$t('dept.deptCode')" width="150" />
        <el-table-column prop="deptName" :label="$t('dept.deptName')" width="200" />
        <el-table-column prop="description" :label="$t('dept.description')" show-overflow-tooltip />
        <el-table-column prop="status" :label="$t('dept.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? $t('dept.statusActive') : $t('dept.statusInactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" :label="排序" width="80" />
        <el-table-column prop="createdAt" :label="$t('dept.createdAt')" width="180" />
        <el-table-column :label="$t('dept.actions')" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button type="info" size="small" @click="handleView(row)">
              {{ $t('dept.viewDept') }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('dept.editDept') : $t('dept.add')"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item :label="$t('dept.deptCode')" prop="deptCode">
          <el-input v-model="form.deptCode" :placeholder="$t('dept.deptCode')" :disabled="dialog.isEdit" />
        </el-form-item>
        <el-form-item :label="$t('dept.deptName')" prop="deptName">
          <el-input v-model="form.deptName" :placeholder="$t('dept.deptName')" />
        </el-form-item>
        <el-form-item :label="$t('dept.parentId')" prop="parentId">
          <el-select
            v-model="form.parentId"
            :placeholder="$t('dept.selectParent')"
            clearable
            style="width: 100%"
          >
            <el-option :label="$t('dept.noParent')" :value="null" />
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.id"
              :label="dept.label"
              :value="dept.id"
              :disabled="form.id && dept.id === form.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dept.description')" prop="description">
          <el-input
            v-model="form.description"
            :placeholder="$t('dept.description')"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item :label="$t('dept.status')" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('dept.statusActive')"
            :inactive-text="$t('dept.statusInactive')"
          />
        </el-form-item>
        <el-form-item :label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- View Dialog -->
    <el-dialog
      v-model="viewDialog.visible"
      :title="$t('dept.viewDept')"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="viewData.current">
        <el-descriptions-item :label="$t('dept.deptCode')">
          {{ viewData.current.deptCode }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('dept.deptName')">
          {{ viewData.current.deptName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('dept.parentDept')">
          {{ viewData.current.parent?.deptName || $t('dept.noParent') }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('dept.status')">
          <el-tag :type="viewData.current.status === 1 ? 'success' : 'danger'">
            {{ viewData.current.status === 1 ? $t('dept.statusActive') : $t('dept.statusInactive') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('dept.description')" :span="2">
          {{ viewData.current.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('dept.createdAt')">
          {{ viewData.current.createdAt }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>{{ $t('dept.childDepts') }}</el-divider>
      
      <el-tree
        v-if="viewData.children && viewData.children.length > 0"
        :data="viewData.children"
        :props="{ label: 'deptName', children: 'children' }"
        default-expand-all
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ data.deptCode }} - {{ data.deptName }}</span>
          </span>
        </template>
      </el-tree>
      <el-empty v-else :description="$t('common.noData')" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getDepartmentList, getDepartmentTree, getDepartmentDetail, createDepartment, updateDepartment, deleteDepartment } from '@/api/department'

const { t } = useI18n()

// State
const loading = ref(false)
const departmentTree = ref<any[]>([])
const allDepartments = ref<any[]>([])

// Search form
const searchForm = reactive({
  deptCode: '',
  deptName: ''
})

// Dialog
const dialog = reactive({
  visible: false,
  isEdit: false
})

// Form
const formRef = ref()
const submitting = ref(false)
const form = reactive<any>({
  id: null,
  deptCode: '',
  deptName: '',
  parentId: null,
  description: '',
  status: 1,
  sortOrder: 0
})

// Rules
const rules = {
  deptCode: [{ required: true, message: t('dept.validation.deptCodeRequired'), trigger: 'blur' }],
  deptName: [{ required: true, message: t('dept.validation.deptNameRequired'), trigger: 'blur' }]
}

// View Dialog
const viewDialog = reactive({
  visible: false
})
const viewData = reactive({
  current: null as any,
  children: [] as any[]
})

// Filtered departments for table
const filteredDepartments = computed(() => {
  let result = departmentTree.value
  
  if (searchForm.deptCode || searchForm.deptName) {
    const filterTree = (nodes: any[]): any[] => {
      return nodes.reduce((acc: any[], node) => {
        const matches = 
          (!searchForm.deptCode || node.deptCode?.includes(searchForm.deptCode)) &&
          (!searchForm.deptName || node.deptName?.includes(searchForm.deptName))
        
        const children = filterTree(node.children || [])
        
        if (matches || children.length > 0) {
          acc.push({ ...node, children })
        }
        
        return acc
      }, [])
    }
    result = filterTree(departmentTree.value)
  }
  
  return result
})

// Department options for select (flat with indentation)
const departmentOptions = computed(() => {
  const flatten = (nodes: any[], level = 0): any[] => {
    return nodes.reduce((acc: any[], node) => {
      const prefix = ' '.repeat(level * 2) + (level > 0 ? '└─ ' : '')
      acc.push({
        id: node.id,
        label: prefix + node.deptName,
        level
      })
      if (node.children && node.children.length > 0) {
        acc.push(...flatten(node.children, level + 1))
      }
      return acc
    }, [])
  }
  return flatten(departmentTree.value)
})

// Load data
const fetchDepartments = async () => {
  loading.value = true
  try {
    const res = await getDepartmentTree()
    departmentTree.value = res.data || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDepartments()
})

// Search
const handleSearch = () => {
  // Tree filtering is handled by computed property
}

// Reset
const handleReset = () => {
  searchForm.deptCode = ''
  searchForm.deptName = ''
}

// Add
const handleAdd = () => {
  dialog.isEdit = false
  dialog.visible = true
  Object.assign(form, {
    id: null,
    deptCode: '',
    deptName: '',
    parentId: null,
    description: '',
    status: 1,
    sortOrder: 0
  })
}

// Edit
const handleEdit = (row: any) => {
  dialog.isEdit = true
  dialog.visible = true
  Object.assign(form, {
    id: row.id,
    deptCode: row.deptCode,
    deptName: row.deptName,
    parentId: row.parentId,
    description: row.description,
    status: row.status,
    sortOrder: row.sortOrder
  })
}

// View
const handleView = async (row: any) => {
  viewDialog.visible = true
  const res = await getDepartmentDetail(row.id)
  viewData.current = res.data
  viewData.children = res.data.children || []
}

// Delete
const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('dept.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await deleteDepartment(row.id)
    ElMessage.success(t('dept.success.delete'))
    fetchDepartments()
  })
}

// Submit
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitting.value = true
    try {
      if (dialog.isEdit && form.id) {
        await updateDepartment(form.id, form)
        ElMessage.success(t('dept.success.update'))
      } else {
        await createDepartment(form)
        ElMessage.success(t('dept.success.create'))
      }
      dialog.visible = false
      fetchDepartments()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || (dialog.isEdit ? t('dept.error.update') : t('dept.error.create')))
    } finally {
      submitting.value = false
    }
  })
}

// Dialog close
const handleDialogClose = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped>
.department-management {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
