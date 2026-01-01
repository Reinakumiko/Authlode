<template>
  <header class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
    <div class="flex items-center justify-between px-6 py-4">
      <!-- Logo 和标题 -->
      <div class="flex items-center space-x-3 group">
        <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300 group-hover:scale-105">
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Logto 用户中心</h1>
          <p class="text-xs text-gray-500">管理系统</p>
        </div>
      </div>

      <!-- 右侧操作区 -->
      <div class="flex items-center space-x-2">
        <!-- 通知图标 -->
        <UButton
          icon="i-heroicons-bell"
          color="gray"
          variant="ghost"
          aria-label="通知"
          class="relative"
          :ui="{ rounded: 'rounded-full' }"
        >
          <UBadge
            color="red"
            variant="solid"
            size="sm"
            class="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0"
          >
            3
          </UBadge>
        </UButton>

        <!-- 分隔线 -->
        <div class="h-8 w-px bg-gray-200 mx-2"></div>

        <!-- 用户信息 -->
        <div class="flex items-center space-x-3">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-gray-900">{{ currentUser.name }}</p>
            <p class="text-xs text-gray-500">{{ currentUser.email }}</p>
          </div>
          <UButton
            icon="i-heroicons-user-circle"
            color="gray"
            variant="ghost"
            aria-label="用户菜单"
            size="lg"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// 临时模拟用户数据,后续从认证状态获取
const currentUser = {
  name: '管理员',
  email: 'admin@example.com',
}
</script>
