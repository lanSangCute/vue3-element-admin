<template>
  <div class="login-log-management">
    <el-card shadow="never">
      <!-- Search Bar -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('log.username')">
          <el-input v-model="searchForm.username" :placeholder="$t('log.username')" clearable />
        </el-form-item>
        <el-form-item :label="$t('log.status')">
          <el-select v-model="searchForm.status" :placeholder="$t('log.allStatus')" clearable style="width: 120px">
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('log.dateRange')">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="-"
            :start-placeholder="$t('log.startDate')"
            :end-placeholder="$t('log.endDate')"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
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

      <!-- Table -->
      <el-table
        v-loading="loading"
        :data="logList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" :label="$t('log.username')" width="120" />
        <el-table-column prop="ip" :label="$t('log.ip')" width="140" />
        <el-table-column prop="status" :label="$t('log.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? $t('log.statusSuccess') : $t('log.statusFailed') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userAgent" :label="$t('log.userAgent')" show-overflow-tooltip />
        <el-table-column prop="createdAt" :label="$t('log.createdAt')" width="180" />
        <el-table-column :label="$t('log.actions')" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              {{ $t('log.viewDetail') }}
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

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialog.visible"
      :title="$t('log.loginLogDetail')"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('log.id')">{{ detailDialog.data.id }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.username')">{{ detailDialog.data.username }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.ip')">{{ detailDialog.data.ip || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.status')">{{ detailDialog.data.status === 'success' ? $t('log.statusSuccess') : $t('log.statusFailed') }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.userAgent')">{{ detailDialog.data.userAgent || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="$t('log.createdAt')">{{ detailDialog.data.createdAt }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialog.visible = false">{{ $t('common.close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getLoginLogs } from '@/api/log'

const { t } = useI18n()

// State
const loading = ref(false)
const logList = ref<any[]>([])
const total = ref(0)

// Search form
const searchForm = reactive({
  username: '',
  status: ''
})

// Date range
const dateRange = ref<[string, string] | null>(null)

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 10
})

// Detail dialog
const detailDialog = reactive({
  visible: false,
  data: {} as any
})

// Fetch logs
const fetchLogList = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    if (dateRange.value) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const res = await getLoginLogs(params)
    logList.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

// Load data
onMounted(() => {
  fetchLogList()
})

// Search
const handleSearch = () => {
  fetchLogList()
}

// Reset
const handleReset = () => {
  searchForm.username = ''
  searchForm.status = ''
  dateRange.value = null
  pagination.page = 1
  fetchLogList()
}

// View detail
const handleViewDetail = (row: any) => {
  detailDialog.data = { ...row }
  detailDialog.visible = true
}
</script>

<style scoped>
.login-log-management {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
