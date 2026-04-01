import request from '@/utils/request'
import type { DashboardStat } from '@/stores/dashboard'

export interface DashboardData {
  stats: DashboardStat[]
  chartData: {
    userTrend: { date: string; value: number }[]
    apiCalls: { date: string; value: number }[]
  }
  recentActivities: Activity[]
}

export interface Activity {
  id: number
  action: string
  user: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export const dashboardApi = {
  getOverview: () =>
    request.get<DashboardData>('/dashboard/overview'),

  getUserStats: () =>
    request.get<{ total: number; active: number; newToday: number }>('/dashboard/users'),

  getSystemStats: () =>
    request.get<{ cpu: number; memory: number; disk: number }>('/dashboard/system'),

  getRecentActivities: () =>
    request.get<Activity[]>('/dashboard/activities'),
}

export default dashboardApi
