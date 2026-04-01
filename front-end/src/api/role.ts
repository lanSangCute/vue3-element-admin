import request from '@/utils/request'

// Get role list
export function getRoleList(params?: any) {
  return request({
    url: '/roles',
    method: 'get',
    params
  })
}

// Get role detail
export function getRoleDetail(id: number) {
  return request({
    url: `/roles/${id}`,
    method: 'get'
  })
}

// Create role
export function createRole(data: any) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

// Update role
export function updateRole(id: number, data: any) {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

// Delete role
export function deleteRole(id: number) {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

// Get users by role
export function getUsersByRole(roleId: number) {
  return request({
    url: `/roles/${roleId}/users`,
    method: 'get'
  })
}

// Assign users to role
export function assignUsersToRole(roleId: number, userIds: number[]) {
  return request({
    url: `/roles/${roleId}/users`,
    method: 'post',
    data: { userIds }
  })
}

// Remove users from role
export function removeUsersFromRole(roleId: number, userIds: number[]) {
  return request({
    url: `/roles/${roleId}/users`,
    method: 'delete',
    data: { userIds }
  })
}

// Get all users (for selection)
export function getAllUsers(params?: any) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}
