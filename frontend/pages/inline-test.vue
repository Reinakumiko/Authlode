<template>
  <div style="background-color: red; color: white; padding: 20px;">
    <h1 style="font-size: 32px;">内联样式测试</h1>
    <p>如果你看到红色背景和白色文字的大标题,说明页面渲染正常</p>
  </div>
  <div class="test-style" style="margin-top: 20px;">
    <h1>CSS 类样式测试</h1>
    <p>如果你看到红色背景,说明 CSS 类加载正常</p>
  </div>
  <div class="bg-blue-500 text-white p-4 mt-4">
    <h1>Tailwind CSS 测试</h1>
    <p>如果你看到蓝色背景,说明 Tailwind 工作正常</p>
  </div>
</template>
