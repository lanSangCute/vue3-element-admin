import request from '@/utils/request'

// Get dict types list
export function getDictTypes(params?: any) {
  return request({
    url: '/dict/types',
    method: 'get',
    params
  })
}

// Get dict type detail
export function getDictTypeDetail(id: number) {
  return request({
    url: `/dict/types/${id}`,
    method: 'get'
  })
}

// Create dict type
export function createDictType(data: any) {
  return request({
    url: '/dict/types',
    method: 'post',
    data
  })
}

// Update dict type
export function updateDictType(id: number, data: any) {
  return request({
    url: `/dict/types/${id}`,
    method: 'put',
    data
  })
}

// Delete dict type
export function deleteDictType(id: number) {
  return request({
    url: `/dict/types/${id}`,
    method: 'delete'
  })
}

// Get dict data by type
export function getDictDataByType(type: string, params?: any) {
  return request({
    url: `/dict/types/${type}/data`,
    method: 'get',
    params
  })
}

// Get dict data list
export function getDictDataList(params?: any) {
  return request({
    url: '/dict/data',
    method: 'get',
    params
  })
}

// Create dict data
export function createDictData(data: any) {
  return request({
    url: '/dict/data',
    method: 'post',
    data
  })
}

// Update dict data
export function updateDictData(id: number, data: any) {
  return request({
    url: `/dict/data/${id}`,
    method: 'put',
    data
  })
}

// Delete dict data
export function deleteDictData(id: number) {
  return request({
    url: `/dict/data/${id}`,
    method: 'delete'
  })
}

// Get dict data for dropdown (public API)
export function getDictForDropdown(type: string) {
  return request({
    url: `/dict/${type}`,
    method: 'get'
  })
}
