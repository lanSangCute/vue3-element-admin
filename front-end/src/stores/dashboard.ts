import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface DashboardStat {
  title: string
  value: number | string
  icon: string
  color: string
  trend?: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStat[]>([])
  const loading = ref(false)

  const defaultStats: DashboardStat[] = [
    { title: 'Total Users', value: 0, icon: 'User', color: '#409EFF', trend: 12 },
    { title: 'Active Sessions', value: 0, icon: 'Monitor', color: '#67C23A', trend: 5 },
    { title: 'API Calls Today', value: 0, icon: 'Connection', color: '#E6A23C', trend: -3 },
    { title: 'System Health', value: '98%', icon: 'CircleCheck', color: '#F56C6C', trend: 2 },
  ]

  function setStats(newStats: DashboardStat[]) {
    stats.value = newStats
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    stats,
    loading,
    defaultStats,
    setStats,
    setLoading
  }
})
