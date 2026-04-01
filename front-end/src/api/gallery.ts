import request from '@/utils/request'

// Get gallery categories tree
export function getGalleryCategories(params?: any) {
  return request({
    url: '/gallery/categories',
    method: 'get',
    params
  })
}

// Create category
export function createCategory(data: any) {
  return request({
    url: '/gallery/categories',
    method: 'post',
    data
  })
}

// Update category
export function updateCategory(id: number, data: any) {
  return request({
    url: `/gallery/categories/${id}`,
    method: 'put',
    data
  })
}

// Delete category
export function deleteCategory(id: number) {
  return request({
    url: `/gallery/categories/${id}`,
    method: 'delete'
  })
}

// Get images list
export function getGalleryImages(params?: any) {
  return request({
    url: '/gallery/images',
    method: 'get',
    params
  })
}

// Upload images
export function uploadImages(data: FormData) {
  return request({
    url: '/gallery/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Delete image
export function deleteImage(id: number) {
  return request({
    url: `/gallery/images/${id}`,
    method: 'delete'
  })
}
