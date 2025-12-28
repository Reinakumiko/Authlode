<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full">
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold text-center">
            Logto User Center
          </h1>
        </template>

        <div class="text-center space-y-4">
          <p class="text-gray-600">
            基于 Logto IAM 的企业级用户中心管理系统
          </p>

          <div class="space-y-2">
            <UButton color="primary" block size="lg">
              开始使用
            </UButton>

            <UButton color="white" block size="lg" variant="outline">
              查看文档
            </UButton>
          </div>

          <div class="pt-4 text-sm text-gray-500">
            <p>✅ 后端: NestJS</p>
            <p>✅ 前端: Nuxt 3 + Nuxt UI</p>
            <p>✅ 数据库: Prisma ORM</p>
          </div>
        </div>
      </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Welcome',
})
</script>
