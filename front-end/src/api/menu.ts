import request from '@/utils/request'

// Get all menus (flat list)
export function getMenuList(params?: any) {
  return request({
    url: '/menus',
    method: 'get',
    params
  })
}

// Get menu tree
export function getMenuTree() {
  return request({
    url: '/menus/tree',
    method: 'get'
  })
}

// Get menu detail with parent and children
export function getMenuDetail(id: number) {
  return request({
    url: `/menus/${id}`,
    method: 'get'
  })
}

// Create menu
export function createMenu(data: any) {
  return request({
    url: '/menus',
    method: 'post',
    data
  })
}

// Update menu
export function updateMenu(id: number, data: any) {
  return request({
    url: `/menus/${id}`,
    method: 'put',
    data
  })
}

// Delete menu
export function deleteMenu(id: number) {
  return request({
    url: `/menus/${id}`,
    method: 'delete'
  })
}

// Get menus by role
export function getMenusByRole(roleId: number) {
  return request({
    url: `/roles/${roleId}/menus`,
    method: 'get'
  })
}

// Get menu tree with role's assigned menu IDs
export function getMenuTreeByRole(roleId: number) {
  return request({
    url: `/roles/${roleId}/menus/tree`,
    method: 'get'
  })
}

// Assign menus to role
export function assignMenusToRole(roleId: number, menuIds: number[]) {
  return request({
    url: `/roles/${roleId}/menus`,
    method: 'post',
    data: { menuIds }
  })
}
