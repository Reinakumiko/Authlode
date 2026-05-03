<template>
  <div class="page-header">
    <div>
      <h1 class="page-title">欢迎回来, 管理员</h1>
      <p class="page-subtitle">今天是 {{ currentDate }}</p>
    </div>
    <button class="btn-primary" @click="$emit('action')">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      创建用户
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  action: []
}>()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
}

.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: var(--text, #1e293b);
}

.page-subtitle {
  font-size: 14px;
  color: var(--text2, #64748b);
  margin-top: 4px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--indigo, #6366f1), var(--purple, #8b5cf6));
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  padding: 10px 20px;
  border-radius: 12px;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}
</style>
