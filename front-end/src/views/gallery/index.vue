<template>
  <div class="gallery-management">
    <el-row :gutter="20">
      <!-- Left: Category Tree -->
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ $t('gallery.categories') }}</span>
              <el-button type="primary" size="small" @click="handleAddCategory">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          
          <el-tree
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            highlight-current
            @node-click="handleCategoryClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span>{{ node.label }}</span>
                <span class="tree-node-actions">
                  <el-button link type="primary" size="small" @click.stop="handleEditCategory(data)">
                    {{ $t('common.edit') }}
                  </el-button>
                  <el-button link type="danger" size="small" @click.stop="handleDeleteCategory(data)">
                    {{ $t('common.delete') }}
                  </el-button>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- Right: Images Grid -->
      <el-col :span="18">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>{{ currentCategoryName || $t('gallery.allImages') }}</span>
              <div class="header-actions">
                <el-input
                  v-model="keyword"
                  :placeholder="$t('gallery.searchImage')"
                  clearable
                  style="width: 200px; margin-right: 10px"
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
                />
                <el-button type="primary" @click="handleUpload">
                  <el-icon><Upload /></el-icon>
                  {{ $t('gallery.upload') }}
                </el-button>
              </div>
            </div>
          </template>
          
          <div v-loading="loading" class="image-grid">
            <el-empty v-if="imageList.length === 0" :description="$t('common.noData')" />
            <div v-else class="image-list">
              <div v-for="image in imageList" :key="image.id" class="image-item">
                <div class="image-wrapper">
                  <el-image
                    :src="image.path"
                    :preview-src-list="[image.path]"
                    fit="cover"
                    class="image-thumb"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="image-info">
                    <span class="image-name">{{ image.originalName }}</span>
                    <span class="image-size">{{ formatSize(image.size) }}</span>
                  </div>
                  <div class="image-actions">
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="handleDeleteImage(image)"
                    >
                      {{ $t('common.delete') }}
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Pagination -->
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :total="total"
            :page-sizes="[20, 40, 60, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSearch"
            @current-change="handleSearch"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- Category Dialog -->
    <el-dialog
      v-model="categoryDialog.visible"
      :title="categoryDialog.isEdit ? $t('gallery.editCategory') : $t('gallery.addCategory')"
      width="500px"
      @close="handleCategoryDialogClose"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="100px"
      >
        <el-form-item :label="$t('gallery.categoryName')" prop="name">
          <el-input v-model="categoryForm.name" :placeholder="$t('gallery.categoryName')" />
        </el-form-item>
        <el-form-item :label="$t('gallery.parentCategory')" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            :placeholder="$t('gallery.topLevel')"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('gallery.sortOrder')" prop="sortOrder">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="categoryDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitCategory" :loading="categorySubmitting">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Upload Dialog -->
    <el-dialog
      v-model="uploadDialog.visible"
      :title="$t('gallery.uploadImages')"
      width="600px"
      @close="handleUploadDialogClose"
    >
      <el-form>
        <el-form-item :label="$t('gallery.category')">
          <el-tree-select
            v-model="uploadCategoryId"
            :data="categoryTree"
            :props="{ label: 'name', children: 'children' }"
            :placeholder="$t('gallery.selectCategory')"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('gallery.selectFiles')">
          <el-upload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            multiple
            accept="image/*"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              {{ $t('gallery.dropFiles') }} <em>{{ $t('gallery.clickUpload') }}</em>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmitUpload" :loading="uploadSubmitting">
          {{ $t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, UploadProps } from 'element-plus'
import { Plus, Upload, UploadFilled, Picture } from '@element-plus/icons-vue'
import { 
  getGalleryCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getGalleryImages,
  uploadImages,
  deleteImage
} from '@/api/gallery'

const { t } = useI18n()

// State
const loading = ref(false)
const categoryTree = ref<any[]>([])
const imageList = ref<any[]>([])
const total = ref(0)
const selectedCategory = ref<any>(null)
const keyword = ref('')

// Pagination
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// Category dialog
const categoryDialog = reactive({
  visible: false,
  isEdit: false
})

const categoryFormRef = ref()
const categorySubmitting = ref(false)
const categoryForm = reactive<any>({
  name: '',
  parentId: null,
  sortOrder: 0
})

const categoryRules = {
  name: [{ required: true, message: t('gallery.validation.categoryNameRequired'), trigger: 'blur' }]
}

// Upload dialog
const uploadDialog = reactive({
  visible: false
})

const uploadRef = ref()
const uploadSubmitting = ref(false)
const uploadCategoryId = ref<number | null>(null)
const fileList = ref<any[]>([])

const currentCategoryName = computed(() => {
  return selectedCategory.value ? selectedCategory.value.name : t('gallery.allImages')
})

// Fetch categories
const fetchCategories = async () => {
  const res = await getGalleryCategories()
  categoryTree.value = res.data || []
}

// Fetch images
const fetchImages = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value.id
    }
    
    if (keyword.value) {
      params.keyword = keyword.value
    }
    
    const res = await getGalleryImages(params)
    imageList.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

// Load data
onMounted(() => {
  fetchCategories()
  fetchImages()
})

// Category click
const handleCategoryClick = (data: any) => {
  selectedCategory.value = data
  pagination.page = 1
  fetchImages()
}

// Add category
const handleAddCategory = () => {
  categoryDialog.isEdit = false
  categoryDialog.visible = true
  Object.assign(categoryForm, {
    name: '',
    parentId: null,
    sortOrder: 0
  })
}

// Edit category
const handleEditCategory = (data: any) => {
  categoryDialog.isEdit = true
  categoryDialog.visible = true
  Object.assign(categoryForm, {
    id: data.id,
    name: data.name,
    parentId: data.parentId,
    sortOrder: data.sortOrder
  })
}

// Delete category
const handleDeleteCategory = (data: any) => {
  ElMessageBox.confirm(t('gallery.deleteCategoryConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await deleteCategory(data.id)
    ElMessage.success(t('gallery.success.deleteCategory'))
    fetchCategories()
    fetchImages()
  })
}

// Submit category
const handleSubmitCategory = async () => {
  if (!categoryFormRef.value) return
  await categoryFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    categorySubmitting.value = true
    try {
      if (categoryDialog.isEdit && categoryForm.id) {
        await updateCategory(categoryForm.id, categoryForm)
        ElMessage.success(t('gallery.success.updateCategory'))
      } else {
        await createCategory(categoryForm)
        ElMessage.success(t('gallery.success.createCategory'))
      }
      categoryDialog.visible = false
      fetchCategories()
    } catch (error) {
      ElMessage.error(categoryDialog.isEdit ? t('gallery.error.updateCategory') : t('gallery.error.createCategory'))
    } finally {
      categorySubmitting.value = false
    }
  })
}

// Category dialog close
const handleCategoryDialogClose = () => {
  categoryFormRef.value?.resetFields()
}

// Search
const handleSearch = () => {
  pagination.page = 1
  fetchImages()
}

// Upload
const handleUpload = () => {
  uploadDialog.visible = true
  uploadCategoryId.value = selectedCategory.value?.id || null
  fileList.value = []
}

// File change
const handleFileChange: UploadProps['onChange'] = (file) => {
  fileList.value.push(file)
}

// File remove
const handleFileRemove: UploadProps['onRemove'] = (file) => {
  fileList.value = fileList.value.filter(f => f.uid !== file.uid)
}

// Submit upload
const handleSubmitUpload = async () => {
  if (!uploadCategoryId.value) {
    ElMessage.warning(t('gallery.warning.selectCategory'))
    return
  }
  
  if (fileList.value.length === 0) {
    ElMessage.warning(t('gallery.warning.selectFiles'))
    return
  }
  
  uploadSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('categoryId', uploadCategoryId.value.toString())
    
    fileList.value.forEach((file: any) => {
      formData.append('files', file.raw)
    })
    
    await uploadImages(formData)
    ElMessage.success(t('gallery.success.upload'))
    uploadDialog.visible = false
    fetchImages()
  } catch (error) {
    ElMessage.error(t('gallery.error.upload'))
  } finally {
    uploadSubmitting.value = false
  }
}

// Upload dialog close
const handleUploadDialogClose = () => {
  uploadRef.value?.clearFiles()
  fileList.value = []
}

// Delete image
const handleDeleteImage = (image: any) => {
  ElMessageBox.confirm(t('gallery.deleteImageConfirm'), t('common.warning'), {
    confirmButtonText: t('common.yes'),
    cancelButtonText: t('common.no'),
    type: 'warning'
  }).then(async () => {
    await deleteImage(image.id)
    ElMessage.success(t('gallery.success.deleteImage'))
    fetchImages()
  })
}

// Format size
const formatSize = (bytes: number) => {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.gallery-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.tree-node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.el-tree-node:hover .tree-node-actions) {
  opacity: 1;
}

.image-grid {
  min-height: 400px;
}

.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.image-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.image-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  position: relative;
}

.image-thumb {
  width: 100%;
  height: 180px;
  display: block;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 180px;
  background: #f5f7fa;
  color: #909399;
  font-size: 40px;
}

.image-info {
  padding: 8px;
  background: #fff;
}

.image-name {
  display: block;
  font-size: 12px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-size {
  display: block;
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

.image-actions {
  padding: 8px;
  background: #f5f7fa;
  text-align: center;
}
</style>
