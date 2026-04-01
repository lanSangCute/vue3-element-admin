import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Dashboard from './components/Dashboard.vue'
import UserManagement from './components/UserManagement.vue'
import RoleManagement from './views/role/index.vue'
import DepartmentManagement from './views/department/index.vue'
import MenuManagement from './views/menu/index.vue'
import OperationLog from './views/log/operation.vue'
import LoginLog from './views/log/login.vue'
import DictManagement from './views/dict/index.vue'
import GalleryManagement from './views/gallery/index.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'DashboardHome',
        component: {
          template: `
            <el-card>
              <template #header>
                <span>Dashboard Overview</span>
              </template>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-statistic title="Total Users" :value="100" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="Active Sessions" :value="25" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="API Calls Today" :value="1234" />
                </el-col>
              </el-row>
              <el-divider />
              <el-alert title="Welcome to the admin dashboard!" type="success" :closable="false" show-icon />
            </el-card>
          `
        }
      },
      {
        path: '/users',
        name: 'UserManagement',
        component: UserManagement
      },
      {
        path: '/roles',
        name: 'RoleManagement',
        component: RoleManagement
      },
      {
        path: '/departments',
        name: 'DepartmentManagement',
        component: DepartmentManagement
      },
      {
        path: '/menus',
        name: 'MenuManagement',
        component: MenuManagement
      },
      {
        path: '/logs/operation',
        name: 'OperationLog',
        component: OperationLog
      },
      {
        path: '/logs/login',
        name: 'LoginLog',
        component: LoginLog
      },
      {
        path: '/dict',
        name: 'DictManagement',
        component: DictManagement
      },
      {
        path: '/gallery',
        name: 'GalleryManagement',
        component: GalleryManagement
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    next('/')
  } else if (to.path === '/' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
