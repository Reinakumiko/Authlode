<template>
  <!-- UI 优化: 添加渐变背景、更柔和的边框、优化整体视觉效果 -->
  <aside class="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200/50 min-h-[calc(100vh-65px)] shadow-sm">
    <nav class="p-4 space-y-1">
      <!-- 仪表板 -->
      <!-- UI 优化: 添加 hover 动画效果 (transition-all duration-200 hover:pl-4) 和 rounded-lg 圆角 -->
      <UButton
        :to="{ name: 'index' }"
        icon="i-heroicons-squares-2x2"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('index')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        仪表板
      </UButton>

      <!-- 用户管理 -->
      <UButton
        :to="{ name: 'users' }"
        icon="i-heroicons-users"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('users')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        用户管理
      </UButton>

      <!-- 组织管理 -->
      <UButton
        :to="{ name: 'organizations' }"
        icon="i-heroicons-building-office-2"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('organizations')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        组织管理
      </UButton>

      <!-- 角色权限 -->
      <UButton
        :to="{ name: 'roles' }"
        icon="i-heroicons-shield-check"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('roles')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        角色权限
      </UButton>

      <!-- 应用管理 -->
      <UButton
        :to="{ name: 'applications' }"
        icon="i-heroicons-rectangle-stack"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('applications')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        应用管理
      </UButton>

      <!-- UI 优化: 分隔线使用更柔和的颜色 -->
      <div class="border-t border-gray-200/50 my-4"></div>

      <!-- 邀请管理 -->
      <UButton
        :to="{ name: 'invitations' }"
        icon="i-heroicons-envelope"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('invitations')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        邀请管理
      </UButton>

      <!-- 审计日志 -->
      <UButton
        :to="{ name: 'audit-logs' }"
        icon="i-heroicons-clipboard-document-list"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('audit-logs')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        审计日志
      </UButton>

      <!-- 数据统计 -->
      <UButton
        :to="{ name: 'statistics' }"
        icon="i-heroicons-chart-bar"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('statistics')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        数据统计
      </UButton>

      <div class="border-t border-gray-200/50 my-4"></div>

      <!-- 系统设置 -->
      <UButton
        :to="{ name: 'settings' }"
        icon="i-heroicons-cog-6-tooth"
        color="gray"
        variant="ghost"
        block
        :active="isActiveRoute('settings')"
        class="transition-all duration-200 hover:pl-4 rounded-lg"
      >
        系统设置
      </UButton>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const route = useRoute()

const isActiveRoute = (routeName: string) => {
  return route.name === routeName
}
</script>
