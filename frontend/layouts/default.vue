<template>
  <div class="app-layout">
    <!-- Gradient Orbs -->
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>

    <!-- Layout: Sidebar + Main -->
    <div class="layout">
      <AppSidebar />
      <main class="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s - Authlode',
  htmlAttrs: {
    lang: 'zh-CN'
  }
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.layout {
  display: flex;
  height: 100vh;
  position: relative;
  z-index: 1;
}

.main {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
  scrollbar-width: thin;
}

/* Custom scrollbar */
.main::-webkit-scrollbar {
  width: 6px;
}

.main::-webkit-scrollbar-track {
  background: transparent;
}

.main::-webkit-scrollbar-thumb {
  background: rgba(203, 213, 225, 0.5);
  border-radius: 3px;
}

.main::-webkit-scrollbar-thumb:hover {
  background: rgba(203, 213, 225, 0.8);
}
</style>
