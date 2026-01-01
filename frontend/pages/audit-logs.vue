<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">审计日志</h2>
        <p class="text-gray-600 mt-1">查看系统操作审计记录</p>
      </div>
      <UButton icon="i-heroicons-arrow-down-tray" color="gray" variant="ghost" size="md">
        导出日志
      </UButton>
    </div>

    <UCard>
      <div class="text-center py-12">
        <UIcon name="i-heroicons-clipboard-document-list" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">审计日志功能开发中</h3>
        <p class="text-gray-500">此页面将在后续版本中实现</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '审计日志',
})
</script>
