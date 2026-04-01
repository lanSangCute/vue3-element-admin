<template>
  <div class="dashboard-container">
    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :default-active="activeMenu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </el-menu-item>
          
          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>{{ $t('nav.systemManagement') }}</span>
            </template>
            <el-menu-item index="/users">
              <el-icon><User /></el-icon>
              <span>{{ $t('nav.userManagement') }}</span>
            </el-menu-item>
            <el-menu-item index="/roles">
              <el-icon><UserFilled /></el-icon>
              <span>{{ $t('nav.roleManagement') }}</span>
            </el-menu-item>
            <el-menu-item index="/departments">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ $t('nav.departmentManagement') }}</span>
            </el-menu-item>
            <el-menu-item index="/menus">
              <el-icon><Menu /></el-icon>
              <span>{{ $t('nav.menuManagement') }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="logs">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>{{ $t('nav.logManagement') }}</span>
            </template>
            <el-menu-item index="/logs/operation">
              <el-icon><Document /></el-icon>
              <span>{{ $t('nav.operationLog') }}</span>
            </el-menu-item>
            <el-menu-item index="/logs/login">
              <el-icon><Key /></el-icon>
              <span>{{ $t('nav.loginLog') }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/dict">
            <el-icon><Collection /></el-icon>
            <span>{{ $t('nav.dictManagement') }}</span>
          </el-menu-item>
          
          <el-menu-item index="/gallery">
            <el-icon><Picture /></el-icon>
            <span>{{ $t('nav.galleryManagement') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="header-content">
            <h3>Vue3 Element Admin</h3>
            <div class="user-info">
              <el-dropdown @command="handleCommand">
                <span class="user-name">
                  <el-avatar :size="32" icon="User" />
                  {{ user?.username }}
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">Logout</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>
        
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { UserFilled, OfficeBuilding, Menu, Setting, Document, Key, Collection, Picture } from '@element-plus/icons-vue'

const { t } = useI18n()
const route = useRoute()
const user = ref<any>(null)

const activeMenu = computed(() => route.path)

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  } else {
    window.location.href = '/'
  }
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    ElMessage.success(t('nav.logout'))
    window.location.href = '/'
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
}

.aside {
  background-color: #304156;
  height: 100vh;
}

:deep(.el-menu) {
  border-right: none;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-content h3 {
  margin: 0;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

:deep(.el-main) {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>
