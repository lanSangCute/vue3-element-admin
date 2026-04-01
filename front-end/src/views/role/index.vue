<template>
  <div class="role-management">
    <el-card shadow="never">
      <!-- Search Bar -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('role.roleCode')">
          <el-input v-model="searchForm.roleCode" :placeholder="$t('role.roleCode')" clearable />
        </el-form-item>
        <el-form-item :label="$t('role.roleName')">
          <el-input v-model="searchForm.roleName" :placeholder="$t('role.roleName')" clearable />
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
          {{ $t('role.add') }}
        </el-button>
      </div>

      <!-- Table -->
      <el-table
        v-loading="loading"
        :data="roleList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleCode" :label="$t('role.roleCode')" />
        <el-table-column prop="roleName" :label="$t('role.roleName')" />
        <el-table-column prop="description" :label="$t('role.description')" show-overflow-tooltip />
        <el-table-column prop="status" :label="$t('role.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? $t('role.statusActive') : $t('role.statusInactive') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="$t('role.createdAt')" width="180" />
        <el-table-column :label="$t('role.actions')" width="380" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              {{ $t('common.edit') }}
            </el-button>
            <el-button type="warning" size="small" @click="handleAssignMenus(row)">
              {{ $t('role.assignMenus') }}
            </el-button>
            <el-button type="success" size="small" @click="handleAssignUsers(row)">
              {{ $t('role.assignUsers') }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('role.editRole') : $t('role.add')"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item :label="$t('role.roleCode')" prop="roleCode">
          <el-input v-model="form.roleCode" :placeholder="$t('role.roleCode')" :disabled="dialog.isEdit" />
        </el-form-item>
        <el-form-item :label="$t('role.roleName')" prop="roleName">
          <el-input v-model="form.roleName" :placeholder="$t('role.roleName')" />
        </el-form-item>
        <el-form-item :label="$t('role.description')" prop="description">
          <el-input
            v-model="form.description"
            :placeholder="$t('role.description')"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item :label="$t('role.status')" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('role.statusActive')"
            :inactive-text="$t('role.statusInactive')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Assign Menus Dialog -->
    <el-dialog
      v-model="menuAssignDialog.visible"
      :title="$t('role.assignMenus')"
      width="600px"
    >
      <el-tree
        ref="menuTreeRef"
        :data="menuTree"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        default-expand-all
        :check-strictly="false"
        node-key="id"
      />
      <template #footer>
        <el-button @click="menuAssignDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleMenuAssignSubmit">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Assign Users Dialog -->
    <el-dialog
      v-model="assignDialog.visible"
      :title="$t('role.assignUsers')"
      width="800px"
    >
      <el-row :gutter="20">
        <!-- All Users -->
        <el-col :span="12">
          <div class="user-panel">
            <h4>{{ $t('role.userList') }}</h4>
            <el-input
              v-model="userSearch"
              :placeholder="$t('common.search')"
              clearable
              style="margin-bottom: 10px"
            />
            <el-table
              :data="filteredAllUsers"
              border
              height="400"
              @selection-change="handleAllUsersSelection"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="username" label="Username" />
              <el-table-column prop="email" label="Email" />
            </el-table>
          </div>
        </el-col>

        <!-- Assigned Users -->
        <el-col :span="12">
          <div class="user-panel">
            <h4>{{ $t('role.assignedUsers') }}</h4>
            <el-table :data="assignedUsers" border height="400">
              <el-table-column prop="username" label="Username" />
              <el-table-column prop="email" label="Email" />
              <el-table-column :label="$t('role.actions')" width="80">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    size="small"
                    @click="handleRemoveUser(row)"
                  >
                    {{ $t('common.delete') }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="assignDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleAssignSubmit">
          {{ $t('role.addUsers') }}
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
import request from '@/utils/request'
import { getMenuTreeByRole, assignMenusToRole } from '@/api/menu'

const { t } = useI18n()

// State
const loading = ref(false)
const roleList = ref<any[]>([])
const total = ref(0)
const assignedUsers = ref<any[]>([])
const allUsers = ref<any[]>([])
const menuTree = ref<any[]>([])

// Search form
const searchForm = reactive({
  roleCode: '',
  roleName: ''
})

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10
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
  roleCode: '',
  roleName: '',
  description: '',
  status: 1
})

// Rules
const rules = {
  roleCode: [{ required: true, message: t('role.validation.roleCodeRequired'), trigger: 'blur' }],
  roleName: [{ required: true, message: t('role.validation.roleNameRequired'), trigger: 'blur' }]
}

// Assign Menus Dialog
const menuAssignDialog = reactive({
  visible: false,
  currentRoleId: null as number | null
})

const menuTreeRef = ref()

// Assign Users Dialog
const assignDialog = reactive({
  visible: false,
  currentRoleId: null as number | null
})

const userSearch = ref('')
const selectedUsers = ref<any[]>([])

// Filtered users for search
const filteredAllUsers = computed(() => {
  if (!userSearch.value) return allUsers.value
  return allUsers.value.filter(
    (user: any) =>
      user.username?.toLowerCase().includes(userSearch.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.value.toLowerCase())
  )
})

// API functions
const fetchRoleList = async () => {
  loading.value = true
  try {
    const res = await request({
      url: '/roles',
      method: 'get',
      params: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...searchForm
      }
    })
    roleList.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const fetchAssignedUsers = async (roleId: number) => {
  const res = await request({
    url: `/roles/${roleId}/users`,
    method: 'get'
  })
  assignedUsers.value = res.data || []
}

const fetchAllUsers = async () => {
  const res = await request({
    url: '/users',
    method: 'get'
  })
  allUsers.value = res.data || []
}

// Load data
onMounted(() => {
  fetchRoleList()
})

// Search
const handleSearch = () => {
  fetchRoleList()
}

// Reset
const handleReset = () => {
  searchForm.roleCode = ''
  searchForm.roleName = ''
  pagination.page = 1
  fetchRoleList()
}

// Add
const handleAdd = () => {
  dialog.isEdit = false
  dialog.visible = true
  Object.assign(form, {
    roleCode: '',
    roleName: '',
    description: '',
    status: 1
  })
}

// Edit
const handleEdit = (row: any) => {
  dialog.isEdit = true
  dialog.visible = true
  Object.assign(form, row)
}

// Delete
const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('role.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await request({
      url: `/roles/${row.id}`,
      method: 'delete'
    })
    ElMessage.success(t('role.success.delete'))
    fetchRoleList()
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
        await request({
          url: `/roles/${form.id}`,
          method: 'put',
          data: form
        })
        ElMessage.success(t('role.success.update'))
      } else {
        await request({
          url: '/roles',
          method: 'post',
          data: form
        })
        ElMessage.success(t('role.success.create'))
      }
      dialog.visible = false
      fetchRoleList()
    } catch (error) {
      ElMessage.error(dialog.isEdit ? t('role.error.update') : t('role.error.create'))
    } finally {
      submitting.value = false
    }
  })
}

// Dialog close
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

// Assign Menus
const handleAssignMenus = async (row: any) => {
  menuAssignDialog.currentRoleId = row.id
  menuAssignDialog.visible = true
  const res = await getMenuTreeByRole(row.id)
  menuTree.value = res.data || []
  // Wait for next tick and set checked nodes
  setTimeout(() => {
    if (menuTreeRef.value) {
      const checkedKeys = getCheckedMenuIds(menuTree.value)
      menuTreeRef.value.setCheckedKeys(checkedKeys)
    }
  }, 100)
}

// Recursively get all checked menu IDs
const getCheckedMenuIds = (nodes: any[]): number[] => {
  let ids: number[] = []
  for (const node of nodes) {
    if (node.checked) {
      ids.push(node.id)
    }
    if (node.children && node.children.length > 0) {
      ids = [...ids, ...getCheckedMenuIds(node.children)]
    }
  }
  return ids
}

// Menu assign submit
const handleMenuAssignSubmit = async () => {
  if (!menuAssignDialog.currentRoleId || !menuTreeRef.value) return
  const checkedNodes = menuTreeRef.value.getCheckedNodes()
  const halfCheckedNodes = menuTreeRef.value.getHalfCheckedNodes()
  const allCheckedIds = [...checkedNodes, ...halfCheckedNodes].map((n: any) => n.id)
  
  await assignMenusToRole(menuAssignDialog.currentRoleId, allCheckedIds)
  ElMessage.success(t('role.success.assignMenus'))
  menuAssignDialog.visible = false
}

// Assign Users
const handleAssignUsers = async (row: any) => {
  assignDialog.currentRoleId = row.id
  assignDialog.visible = true
  await fetchAssignedUsers(row.id)
  await fetchAllUsers()
}

// All users selection
const handleAllUsersSelection = (selection: any[]) => {
  selectedUsers.value = selection
}

// Remove user from role
const handleRemoveUser = async (user: any) => {
  if (!assignDialog.currentRoleId) return
  await request({
    url: `/roles/${assignDialog.currentRoleId}/users`,
    method: 'delete',
    data: { userIds: [user.id] }
  })
  ElMessage.success(t('role.success.assignUsers'))
  fetchAssignedUsers(assignDialog.currentRoleId)
}

// Assign submit
const handleAssignSubmit = async () => {
  if (!assignDialog.currentRoleId || selectedUsers.value.length === 0) return
  const userIds = selectedUsers.value.map((u) => u.id)
  await request({
    url: `/roles/${assignDialog.currentRoleId}/users`,
    method: 'post',
    data: { userIds }
  })
  ElMessage.success(t('role.success.assignUsers'))
  fetchAssignedUsers(assignDialog.currentRoleId)
  selectedUsers.value = []
}
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.action-bar {
  margin-bottom: 20px;
}

.user-panel h4 {
  margin: 0 0 10px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}
</style>
