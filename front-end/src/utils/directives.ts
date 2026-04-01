import type { Directive, App } from 'vue'
import { usePermissionStore } from '@/stores/permission'

// v-permission directive
const permissionDirective: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()

    if (value && value instanceof Array && value.length > 0) {
      const hasPermission = permissionStore.hasAnyPermission(value)

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('Please provide permission array, e.g., v-permission="[\'user:create\']"')
    }
  }
}

// v-role directive
const roleDirective: Directive = {
  mounted(el, binding) {
    const { value } = binding
    const permissionStore = usePermissionStore()

    if (value && value instanceof Array && value.length > 0) {
      const hasRole = value.includes(permissionStore.role)

      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('Please provide role array, e.g., v-role="[\'admin\']"')
    }
  }
}

export function setupDirectives(app: App) {
  app.directive('permission', permissionDirective)
  app.directive('role', roleDirective)
}

export { permissionDirective, roleDirective }
