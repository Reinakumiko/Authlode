<template>
  <div>
    <div class="test-style p-4">
      如果看到红色背景和白色文字,说明 CSS 加载成功!
    </div>
    <div class="bg-blue-500 text-white p-4 mt-4">
      如果看到蓝色背景,说明 Tailwind CSS 工作正常!
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '样式测试',
})
</script>
