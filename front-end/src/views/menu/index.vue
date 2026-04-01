<template>
  <div class="menu-management">
    <el-card shadow="never">
      <!-- Search Bar -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('menu.name')">
          <el-input v-model="searchForm.name" :placeholder="$t('menu.name')" clearable />
        </el-form-item>
        <el-form-item :label="$t('menu.permission')">
          <el-input v-model="searchForm.permission" :placeholder="$t('menu.permission')" clearable />
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
          {{ $t('menu.add') }}
        </el-button>
      </div>

      <!-- Menu Tree Table -->
      <el-table
        v-loading="loading"
        :data="filteredMenus"
        border
        stripe
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" :label="$t('menu.name')" width="200" />
        <el-table-column prop="type" :label="$t('menu.type')" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ $t(`menu.type.${row.type}`) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" :label="$t('menu.icon')" width="80">
          <template #default="{ row }">
            <el-icon v-if="row.icon" :size="20">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="$t('menu.path')" show-overflow-tooltip />
        <el-table-column prop="permission" :label="$t('menu.permission')" show-overflow-tooltip />
        <el-table-column prop="sortOrder" :label="$t('menu.sortOrder')" width="80" />
        <el-table-column prop="createdAt" :label="$t('menu.createdAt')" width="180" />
        <el-table-column :label="$t('menu.actions')" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              {{ $t('common.edit') }}
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
      :title="dialog.isEdit ? $t('menu.edit') : $t('menu.add')"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item :label="$t('menu.type')" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="directory">{{ $t('menu.type.directory') }}</el-radio>
            <el-radio value="menu">{{ $t('menu.type.menu') }}</el-radio>
            <el-radio value="button">{{ $t('menu.type.button') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('menu.name')" prop="name">
          <el-input v-model="form.name" :placeholder="$t('menu.name')" />
        </el-form-item>
        <el-form-item :label="$t('menu.parentId')" prop="parentId">
          <el-select
            v-model="form.parentId"
            :placeholder="$t('menu.selectParent')"
            clearable
            style="width: 100%"
          >
            <el-option :label="$t('menu.topLevel')" :value="null" />
            <el-option
              v-for="menu in menuOptions"
              :key="menu.id"
              :label="menu.label"
              :value="menu.id"
              :disabled="form.id && menu.id === form.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('menu.path')" prop="path">
          <el-input v-model="form.path" :placeholder="$t('menu.pathPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('menu.icon')" prop="icon">
          <el-select
            v-model="form.icon"
            :placeholder="$t('menu.selectIcon')"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="icon in iconOptions"
              :key="icon"
              :label="icon"
              :value="icon"
            >
              <span style="display: flex; align-items: center; gap: 8px">
                <el-icon :size="18"><component :is="icon" /></el-icon>
                {{ icon }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('menu.permission')" prop="permission">
          <el-input v-model="form.permission" :placeholder="$t('menu.permissionPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('menu.sortOrder')" prop="sortOrder">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getMenuTree, getMenuDetail, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const { t } = useI18n()

// Icon options
const iconOptions = [
  'Setting', 'User', 'UserFilled', 'OfficeBuilding', 'Menu', 'Document',
  'Folder', 'Search', 'Edit', 'Delete', 'Plus', 'Refresh', 'Check',
  'Close', 'Home', 'Star', 'Bell', 'Calendar', 'Clock', 'Filter',
  'Sort', 'Download', 'Upload', 'Lock', 'Unlock', 'Key', 'Connection'
]

// State
const loading = ref(false)
const menuTree = ref<any[]>([])

// Search form
const searchForm = reactive({
  name: '',
  permission: ''
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
  parentId: null,
  name: '',
  path: '',
  icon: '',
  type: 'directory',
  permission: '',
  sortOrder: 0
})

// Rules
const rules = {
  type: [{ required: true, message: t('menu.validation.typeRequired'), trigger: 'change' }],
  name: [{ required: true, message: t('menu.validation.nameRequired'), trigger: 'blur' }]
}

// Get type tag color
const getTypeTag = (type: string) => {
  const map: Record<string, any> = {
    directory: 'warning',
    menu: 'success',
    button: 'info'
  }
  return map[type] || ''
}

// Filtered menus for table
const filteredMenus = computed(() => {
  let result = menuTree.value
  
  if (searchForm.name || searchForm.permission) {
    const filterTree = (nodes: any[]): any[] => {
      return nodes.reduce((acc: any[], node) => {
        const matches = 
          (!searchForm.name || node.name?.toLowerCase().includes(searchForm.name.toLowerCase())) &&
          (!searchForm.permission || node.permission?.toLowerCase().includes(searchForm.permission.toLowerCase()))
        
        const children = filterTree(node.children || [])
        
        if (matches || children.length > 0) {
          acc.push({ ...node, children })
        }
        
        return acc
      }, [])
    }
    result = filterTree(menuTree.value)
  }
  
  return result
})

// Menu options for select (flat with indentation)
const menuOptions = computed(() => {
  const flatten = (nodes: any[], level = 0): any[] => {
    return nodes.reduce((acc: any[], node) => {
      const prefix = ' '.repeat(level * 2) + (level > 0 ? '└─ ' : '')
      acc.push({
        id: node.id,
        label: prefix + node.name,
        level
      })
      if (node.children && node.children.length > 0) {
        acc.push(...flatten(node.children, level + 1))
      }
      return acc
    }, [])
  }
  return flatten(menuTree.value)
})

// Load data
const fetchMenus = async () => {
  loading.value = true
  try {
    const res = await getMenuTree()
    menuTree.value = res.data || []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMenus()
})

// Search
const handleSearch = () => {
  // Tree filtering is handled by computed property
}

// Reset
const handleReset = () => {
  searchForm.name = ''
  searchForm.permission = ''
}

// Add
const handleAdd = () => {
  dialog.isEdit = false
  dialog.visible = true
  Object.assign(form, {
    id: null,
    parentId: null,
    name: '',
    path: '',
    icon: '',
    type: 'directory',
    permission: '',
    sortOrder: 0
  })
}

// Edit
const handleEdit = (row: any) => {
  dialog.isEdit = true
  dialog.visible = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    path: row.path,
    icon: row.icon,
    type: row.type,
    permission: row.permission,
    sortOrder: row.sortOrder
  })
}

// Delete
const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('menu.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await deleteMenu(row.id)
    ElMessage.success(t('menu.success.delete'))
    fetchMenus()
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
        await updateMenu(form.id, form)
        ElMessage.success(t('menu.success.update'))
      } else {
        await createMenu(form)
        ElMessage.success(t('menu.success.create'))
      }
      dialog.visible = false
      fetchMenus()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || (dialog.isEdit ? t('menu.error.update') : t('menu.error.create')))
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
.menu-management {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}
</style>
