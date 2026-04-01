import { defineStore } from 'pinia'
import {
  getRoleList,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  getUsersByRole,
  assignUsersToRole,
  removeUsersFromRole,
  getAllUsers
} from '@/api/role'

export interface Role {
  id?: number
  roleCode: string
  roleName: string
  description?: string
  status: number
  createdAt?: string
  updatedAt?: string
}

export interface User {
  id: number
  username: string
  email: string
  nickname?: string
}

export const useRoleStore = defineStore('role', {
  state: () => ({
    roleList: [] as Role[],
    currentRole: null as Role | null,
    assignedUsers: [] as User[],
    allUsers: [] as User[],
    total: 0,
    loading: false
  }),

  actions: {
    async fetchRoleList(params?: any) {
      this.loading = true
      try {
        const res = await getRoleList(params)
        this.roleList = res.data?.list || []
        this.total = res.data?.total || 0
        return res
      } finally {
        this.loading = false
      }
    },

    async fetchRoleDetail(id: number) {
      this.loading = true
      try {
        const res = await getRoleDetail(id)
        this.currentRole = res.data
        return res
      } finally {
        this.loading = false
      }
    },

    async createRole(data: Partial<Role>) {
      return await createRole(data)
    },

    async updateRole(id: number, data: Partial<Role>) {
      return await updateRole(id, data)
    },

    async deleteRole(id: number) {
      return await deleteRole(id)
    },

    async fetchAssignedUsers(roleId: number) {
      const res = await getUsersByRole(roleId)
      this.assignedUsers = res.data || []
      return res
    },

    async fetchAllUsers() {
      const res = await getAllUsers()
      this.allUsers = res.data || []
      return res
    },

    async assignUsers(roleId: number, userIds: number[]) {
      return await assignUsersToRole(roleId, userIds)
    },

    async removeUsers(roleId: number, userIds: number[]) {
      return await removeUsersFromRole(roleId, userIds)
    },

    setCurrentRole(role: Role | null) {
      this.currentRole = role
    }
  }
})
