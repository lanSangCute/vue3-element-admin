import request from '@/utils/request'

// Get all departments (flat list)
export function getDepartmentList(params?: any) {
  return request({
    url: '/departments',
    method: 'get',
    params
  })
}

// Get department tree
export function getDepartmentTree() {
  return request({
    url: '/departments/tree',
    method: 'get'
  })
}

// Get department detail with parent and children
export function getDepartmentDetail(id: number) {
  return request({
    url: `/departments/${id}`,
    method: 'get'
  })
}

// Create department
export function createDepartment(data: any) {
  return request({
    url: '/departments',
    method: 'post',
    data
  })
}

// Update department
export function updateDepartment(id: number, data: any) {
  return request({
    url: `/departments/${id}`,
    method: 'put',
    data
  })
}

// Delete department
export function deleteDepartment(id: number) {
  return request({
    url: `/departments/${id}`,
    method: 'delete'
  })
}
