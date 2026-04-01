<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>User Management</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>
            Add User
          </el-button>
        </div>
      </template>

      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="Username" />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="created_at" label="Created At" width="180" />
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="showEditDialog(scope.row)">
              Edit
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.username === 'admin'"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? 'Edit User' : 'Add User'"
      width="400px"
    >
      <el-form :model="form" :rules="rules" ref="userFormRef" label-width="80px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="Password" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          Confirm
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import axios from 'axios'

interface User {
  id: number
  username: string
  email: string
  created_at: string
}

const users = ref<User[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const userFormRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  username: '',
  password: '',
  email: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter password', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: 'Please enter valid email', trigger: 'blur' }
  ]
}

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await axios.get('/users')
    users.value = response.data.users
  } catch (error: any) {
    ElMessage.error('Failed to fetch users')
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  isEdit.value = false
  form.id = 0
  form.username = ''
  form.password = ''
  form.email = ''
  dialogVisible.value = true
}

const showEditDialog = (row: User) => {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.email = row.email
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value) {
          await axios.put(`/users/${form.id}`, {
            username: form.username,
            email: form.email
          })
          ElMessage.success('User updated successfully')
        } else {
          await axios.post('/users', {
            username: form.username,
            password: form.password,
            email: form.email
          })
          ElMessage.success('User created successfully')
        }
        dialogVisible.value = false
        fetchUsers()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error || 'Operation failed')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete user "${row.username}"?`,
    'Warning',
    { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' }
  ).then(async () => {
    try {
      await axios.delete(`/users/${row.id}`)
      ElMessage.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.error || 'Delete failed')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
