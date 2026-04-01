export const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export const PERMISSIONS = {
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  DASHBOARD_VIEW: 'dashboard:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const

export const ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const
