<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">角色权限</h2>
        <p class="text-gray-600 mt-1">管理用户角色和权限配置</p>
      </div>
      <UButton icon="i-heroicons-plus" color="primary" size="md">
        创建角色
      </UButton>
    </div>

    <UCard>
      <div class="text-center py-12">
        <UIcon name="i-heroicons-shield-check" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">角色权限管理功能开发中</h3>
        <p class="text-gray-500">此页面将在后续版本中实现</p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '角色权限',
})
</script>
