<template>
  <el-menu
    :default-active="activeMenu"
    class="sidebar-menu"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
    router
  >
    <el-menu-item index="/dashboard">
      <el-icon><House /></el-icon>
      <span>{{ $t('nav.dashboard') }}</span>
    </el-menu-item>

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
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UserFilled, OfficeBuilding, Menu } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path as string)
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: none;
}
</style>
