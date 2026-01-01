<template>
  <div class="space-y-6">
    <!-- 页面标题和操作 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">用户管理</h2>
        <p class="text-gray-600 mt-1">管理系统中的所有用户账户</p>
      </div>
      <UButton
        icon="i-heroicons-user-plus"
        color="primary"
        size="md"
      >
        添加用户
      </UButton>
    </div>

    <!-- 搜索和筛选 -->
    <UCard>
      <div class="flex items-center space-x-4">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="搜索用户名、邮箱..."
          class="flex-1"
        />

        <USelect
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="状态筛选"
          class="w-40"
        />

        <USelect
          v-model="organizationFilter"
          :options="organizationOptions"
          placeholder="组织筛选"
          class="w-40"
        />

        <UButton
          icon="i-heroicons-funnel"
          color="gray"
          variant="ghost"
        >
          更多筛选
        </UButton>
      </div>
    </UCard>

    <!-- 用户列表 -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">用户列表</h3>
            <p class="text-sm text-gray-500 mt-1">共 {{ totalUsers }} 位用户</p>
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              icon="i-heroicons-arrow-uturn-left"
              color="gray"
              variant="ghost"
              size="sm"
            >
              刷新
            </UButton>
            <UButton
              icon="i-heroicons-arrow-down-tray"
              color="gray"
              variant="ghost"
              size="sm"
            >
              导出
            </UButton>
          </div>
        </div>
      </template>

      <!-- 表格 -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left">
                <input type="checkbox" class="rounded border-gray-300">
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                组织
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- 示例数据行 -->
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" class="rounded border-gray-300">
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    张
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">张三</div>
                    <div class="text-xs text-gray-500">@zhangsan</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">zhangsan@example.com</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">研发部</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-1">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    管理员
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  活跃
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">2025-01-15</div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <UButton
                    icon="i-heroicons-eye"
                    color="gray"
                    variant="ghost"
                    size="sm"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </td>
            </tr>

            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" class="rounded border-gray-300">
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    李
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">李四</div>
                    <div class="text-xs text-gray-500">@lisi</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">lisi@example.com</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">产品部</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-1">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    用户
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  活跃
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">2025-01-18</div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                  <UButton
                    icon="i-heroicons-eye"
                    color="gray"
                    variant="ghost"
                    size="sm"
                  />
                  <UButton
                    icon="i-heroicons-pencil"
                    color="gray"
                    variant="ghost"
                    size="sm"
                  />
                  <UButton
                    icon="i-heroicons-trash"
                    color="red"
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <template #footer>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            显示 1-10 条,共 {{ totalUsers }} 条
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              icon="i-heroicons-chevron-left"
              color="gray"
              variant="ghost"
              size="sm"
              disabled
            >
              上一页
            </UButton>
            <UButton
              color="primary"
              variant="soft"
              size="sm"
            >
              1
            </UButton>
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
            >
              2
            </UButton>
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
            >
              3
            </UButton>
            <UButton
              icon="i-heroicons-chevron-right"
              color="gray"
              variant="ghost"
              size="sm"
            >
              下一页
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '用户管理',
})

// 临时数据,后续从 API 获取
const searchQuery = ref('')
const statusFilter = ref('')
const organizationFilter = ref('')
const totalUsers = ref(1234)

const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '活跃', value: 'active' },
  { label: '已禁用', value: 'inactive' },
  { label: '待激活', value: 'pending' },
]

const organizationOptions = [
  { label: '全部组织', value: '' },
  { label: '研发部', value: 'dev' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
]
</script>
