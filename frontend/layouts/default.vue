<template>
  <!-- UI 优化: 使用渐变背景替代纯色,增加视觉深度 -->
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50/50 to-white">
    <!-- 顶部导航栏 -->
    <AppHeader />

    <!-- UI 优化: 为整体布局添加更柔和的阴影效果 -->
    <div class="flex shadow-sm">
      <!-- 侧边栏 -->
      <AppSidebar />

      <!-- UI 优化: 改进主内容区域的 padding 和间距,添加更好的呼吸感 -->
      <main class="flex-1 p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s - Logto User Center',
})
</script>
