import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Permission {
  id: string
  name: string
  description: string
}

export const usePermissionStore = defineStore('permission', () => {
  // All available permissions
  const permissions = ref<Permission[]>([
    { id: 'user:view', name: 'View Users', description: 'Can view user list' },
    { id: 'user:create', name: 'Create Users', description: 'Can create new users' },
    { id: 'user:edit', name: 'Edit Users', description: 'Can edit users' },
    { id: 'user:delete', name: 'Delete Users', description: 'Can delete users' },
    { id: 'dashboard:view', name: 'View Dashboard', description: 'Can view dashboard' },
    { id: 'settings:view', name: 'View Settings', description: 'Can view settings' },
    { id: 'settings:edit', name: 'Edit Settings', description: 'Can edit settings' },
  ])

  // User's assigned permissions
  const userPermissions = ref<string[]>([])

  const hasPermission = computed(() => (permissionId: string) => {
    return userPermissions.value.includes(permissionId)
  })

  const hasAnyPermission = computed(() => (permissionIds: string[]) => {
    return permissionIds.some(id => userPermissions.value.includes(id))
  })

  const hasAllPermissions = computed(() => (permissionIds: string[]) => {
    return permissionIds.every(id => userPermissions.value.includes(id))
  })

  function setPermissions(newPermissions: string[]) {
    userPermissions.value = newPermissions
  }

  function addPermission(permissionId: string) {
    if (!userPermissions.value.includes(permissionId)) {
      userPermissions.value.push(permissionId)
    }
  }

  function removePermission(permissionId: string) {
    userPermissions.value = userPermissions.value.filter(p => p !== permissionId)
  }

  return {
    permissions,
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    setPermissions,
    addPermission,
    removePermission
  }
})
