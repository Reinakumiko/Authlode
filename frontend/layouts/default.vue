<template>
  <div class="app-layout">
    <!-- 流体渐变背景 -->
    <div class="fluid-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="gradient-orb orb-4"></div>
    </div>

    <!-- 顶部导航栏 -->
    <AppHeader />

    <!-- 主体内容 -->
    <div class="layout-body">
      <!-- 侧边栏 -->
      <AppSidebar />

      <!-- 主内容区域 -->
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s - Logto User Center',
  htmlAttrs: {
    lang: 'zh-CN'
  }
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* 流体渐变背景 */
.fluid-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 70%);
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(217, 70, 239, 0.12) 50%, transparent 70%);
  bottom: -150px;
  left: -100px;
  animation-delay: 5s;
}

.orb-3 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(45, 212, 191, 0.22) 0%, rgba(20, 184, 166, 0.13) 50%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

.orb-4 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.18) 0%, rgba(251, 191, 36, 0.1) 50%, transparent 70%);
  bottom: 20%;
  right: 10%;
  animation-delay: 15s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  75% {
    transform: translate(20px, 30px) scale(1.05);
  }
}

.layout-body {
  display: flex;
  min-height: calc(100vh - 65px);
  position: relative;
  z-index: 1;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  background: transparent;
}

/* 自定义滚动条 */
.main-content::-webkit-scrollbar {
  width: 0.375rem;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 0.1875rem;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 213, 225, 0.8);
}
</style>
