<template>
  <div class="dict-management">
    <el-row :gutter="20">
      <!-- Left: Dict Types -->
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ $t('dict.dictTypes') }}</span>
              <el-button type="primary" size="small" @click="handleAddType">
                <el-icon><Plus /></el-icon>
                {{ $t('dict.addType') }}
              </el-button>
            </div>
          </template>
          
          <el-input
            v-model="typeSearch"
            :placeholder="$t('common.search')"
            clearable
            style="margin-bottom: 10px"
          />
          
          <el-table
            v-loading="typeLoading"
            :data="filteredTypes"
            border
            highlight-current-row
            style="width: 100%"
            @current-change="handleTypeChange"
          >
            <el-table-column prop="dictType" :label="$t('dict.dictType')" show-overflow-tooltip />
            <el-table-column prop="dictName" :label="$t('dict.dictName')" show-overflow-tooltip />
            <el-table-column prop="status" :label="$t('dict.status')" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? $t('dict.statusActive') : $t('dict.statusInactive') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="$t('dict.actions')" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click.stop="handleEditType(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click.stop="handleDeleteType(row)">
                  {{ $t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Right: Dict Data -->
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ currentTypeName || $t('dict.selectType') }}</span>
              <el-button 
                v-if="selectedType"
                type="primary" 
                size="small" 
                @click="handleAddData"
              >
                <el-icon><Plus /></el-icon>
                {{ $t('dict.addData') }}
              </el-button>
            </div>
          </template>
          
          <el-table
            v-if="selectedType"
            v-loading="dataLoading"
            :data="dataList"
            border
            stripe
            style="width: 100%"
          >
            <el-table-column prop="dictLabel" :label="$t('dict.dictLabel')" />
            <el-table-column prop="dictValue" :label="$t('dict.dictValue')" />
            <el-table-column prop="sortOrder" :label="$t('dict.sortOrder')" width="100" />
            <el-table-column prop="status" :label="$t('dict.status')" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" :label="$t('dict.createdAt')" width="180" />
            <el-table-column :label="$t('dict.actions')" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEditData(row)">
                  {{ $t('common.edit') }}
                </el-button>
                <el-button type="danger" size="small" @click="handleDeleteData(row)">
                  {{ $t('common.delete') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-else :description="$t('dict.selectTypeFirst')" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Dict Type Dialog -->
    <el-dialog
      v-model="typeDialog.visible"
      :title="typeDialog.isEdit ? $t('dict.editType') : $t('dict.addType')"
      width="500px"
      @close="handleTypeDialogClose"
    >
      <el-form
        ref="typeFormRef"
        :model="typeForm"
        :rules="typeRules"
        label-width="100px"
      >
        <el-form-item :label="$t('dict.dictType')" prop="dictType">
          <el-input 
            v-model="typeForm.dictType" 
            :placeholder="$t('dict.dictType')" 
            :disabled="typeDialog.isEdit"
          />
        </el-form-item>
        <el-form-item :label="$t('dict.dictName')" prop="dictName">
          <el-input v-model="typeForm.dictName" :placeholder="$t('dict.dictName')" />
        </el-form-item>
        <el-form-item :label="$t('dict.description')" prop="description">
          <el-input
            v-model="typeForm.description"
            :placeholder="$t('dict.description')"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item :label="$t('dict.status')" prop="status">
          <el-switch
            v-model="typeForm.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('dict.statusActive')"
            :inactive-text="$t('dict.statusInactive')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitType" :loading="typeSubmitting">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Dict Data Dialog -->
    <el-dialog
      v-model="dataDialog.visible"
      :title="dataDialog.isEdit ? $t('dict.editData') : $t('dict.addData')"
      width="500px"
      @close="handleDataDialogClose"
    >
      <el-form
        ref="dataFormRef"
        :model="dataForm"
        :rules="dataRules"
        label-width="100px"
      >
        <el-form-item :label="$t('dict.dictLabel')" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" :placeholder="$t('dict.dictLabel')" />
        </el-form-item>
        <el-form-item :label="$t('dict.dictValue')" prop="dictValue">
          <el-input v-model="dataForm.dictValue" :placeholder="$t('dict.dictValue')" />
        </el-form-item>
        <el-form-item :label="$t('dict.sortOrder')" prop="sortOrder">
          <el-input-number v-model="dataForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="$t('dict.status')" prop="status">
          <el-switch
            v-model="dataForm.status"
            :active-value="1"
            :inactive-value="0"
            :active-text="$t('dict.statusActive')"
            :inactive-text="$t('dict.statusInactive')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitData" :loading="dataSubmitting">
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
import { 
  getDictTypes, 
  createDictType, 
  updateDictType, 
  deleteDictType,
  getDictDataByType,
  createDictData,
  updateDictData,
  deleteDictData
} from '@/api/dict'

const { t } = useI18n()

// State
const typeLoading = ref(false)
const dataLoading = ref(false)
const typeList = ref<any[]>([])
const dataList = ref<any[]>([])
const selectedType = ref<any>(null)
const typeSearch = ref('')

// Type dialog
const typeDialog = reactive({
  visible: false,
  isEdit: false
})

const typeFormRef = ref()
const typeSubmitting = ref(false)
const typeForm = reactive<any>({
  dictType: '',
  dictName: '',
  description: '',
  status: 1
})

const typeRules = {
  dictType: [{ required: true, message: t('dict.validation.dictTypeRequired'), trigger: 'blur' }],
  dictName: [{ required: true, message: t('dict.validation.dictNameRequired'), trigger: 'blur' }]
}

// Data dialog
const dataDialog = reactive({
  visible: false,
  isEdit: false
})

const dataFormRef = ref()
const dataSubmitting = ref(false)
const dataForm = reactive<any>({
  dictLabel: '',
  dictValue: '',
  sortOrder: 0,
  status: 1
})

const dataRules = {
  dictLabel: [{ required: true, message: t('dict.validation.dictLabelRequired'), trigger: 'blur' }],
  dictValue: [{ required: true, message: t('dict.validation.dictValueRequired'), trigger: 'blur' }]
}

// Filtered types
const filteredTypes = computed(() => {
  if (!typeSearch.value) return typeList.value
  return typeList.value.filter(
    (type: any) =>
      type.dictType?.toLowerCase().includes(typeSearch.value.toLowerCase()) ||
      type.dictName?.toLowerCase().includes(typeSearch.value.toLowerCase())
  )
})

const currentTypeName = computed(() => {
  return selectedType.value ? `${selectedType.value.dictName} (${selectedType.value.dictType})` : ''
})

// Fetch types
const fetchTypeList = async () => {
  typeLoading.value = true
  try {
    const res = await getDictTypes({ page: 1, pageSize: 100 })
    typeList.value = res.data?.list || []
  } finally {
    typeLoading.value = false
  }
}

// Fetch data by type
const fetchDataByType = async (type: string) => {
  dataLoading.value = true
  try {
    const res = await getDictDataByType(type)
    dataList.value = res.data || []
  } finally {
    dataLoading.value = false
  }
}

// Load data
onMounted(() => {
  fetchTypeList()
})

// Type change
const handleTypeChange = (row: any) => {
  selectedType.value = row
  if (row) {
    fetchDataByType(row.dictType)
  } else {
    dataList.value = []
  }
}

// Add type
const handleAddType = () => {
  typeDialog.isEdit = false
  typeDialog.visible = true
  Object.assign(typeForm, {
    dictType: '',
    dictName: '',
    description: '',
    status: 1
  })
}

// Edit type
const handleEditType = (row: any) => {
  typeDialog.isEdit = true
  typeDialog.visible = true
  Object.assign(typeForm, row)
}

// Delete type
const handleDeleteType = (row: any) => {
  ElMessageBox.confirm(t('dict.deleteTypeConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await deleteDictType(row.id)
    ElMessage.success(t('dict.success.deleteType'))
    fetchTypeList()
    if (selectedType.value?.id === row.id) {
      selectedType.value = null
      dataList.value = []
    }
  })
}

// Submit type
const handleSubmitType = async () => {
  if (!typeFormRef.value) return
  await typeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    typeSubmitting.value = true
    try {
      if (typeDialog.isEdit && typeForm.id) {
        await updateDictType(typeForm.id, typeForm)
        ElMessage.success(t('dict.success.updateType'))
      } else {
        await createDictType(typeForm)
        ElMessage.success(t('dict.success.createType'))
      }
      typeDialog.visible = false
      fetchTypeList()
    } catch (error) {
      ElMessage.error(typeDialog.isEdit ? t('dict.error.updateType') : t('dict.error.createType'))
    } finally {
      typeSubmitting.value = false
    }
  })
}

// Type dialog close
const handleTypeDialogClose = () => {
  typeFormRef.value?.resetFields()
}

// Add data
const handleAddData = () => {
  dataDialog.isEdit = false
  dataDialog.visible = true
  Object.assign(dataForm, {
    dictType: selectedType.value.dictType,
    dictLabel: '',
    dictValue: '',
    sortOrder: 0,
    status: 1
  })
}

// Edit data
const handleEditData = (row: any) => {
  dataDialog.isEdit = true
  dataDialog.visible = true
  Object.assign(dataForm, row)
}

// Delete data
const handleDeleteData = (row: any) => {
  ElMessageBox.confirm(t('dict.deleteDataConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await deleteDictData(row.id)
    ElMessage.success(t('dict.success.deleteData'))
    fetchDataByType(selectedType.value.dictType)
  })
}

// Status change
const handleStatusChange = async (row: any) => {
  try {
    await updateDictData(row.id, { status: row.status })
    ElMessage.success(t('dict.success.updateData'))
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error(t('dict.error.updateData'))
  }
}

// Submit data
const handleSubmitData = async () => {
  if (!dataFormRef.value) return
  await dataFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    dataSubmitting.value = true
    try {
      if (dataDialog.isEdit && dataForm.id) {
        await updateDictData(dataForm.id, dataForm)
        ElMessage.success(t('dict.success.updateData'))
      } else {
        await createDictData(dataForm)
        ElMessage.success(t('dict.success.createData'))
      }
      dataDialog.visible = false
      fetchDataByType(selectedType.value.dictType)
    } catch (error) {
      ElMessage.error(dataDialog.isEdit ? t('dict.error.updateData') : t('dict.error.createData'))
    } finally {
      dataSubmitting.value = false
    }
  })
}

// Data dialog close
const handleDataDialogClose = () => {
  dataFormRef.value?.resetFields()
}
</script>

<style scoped>
.dict-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
