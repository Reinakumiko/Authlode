<template>
  <div class="page-container">
    <PageHeader title="审计日志" description="查看系统操作审计记录">
      <template #actions>
        <button class="btn-primary" style="background: linear-gradient(135deg, #14b8a6, #10b981)" @click="exportLogs">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          导出日志
        </button>
      </template>
    </PageHeader>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <label class="filter-label">日期范围</label>
        <div class="date-range">
          <input v-model="dateFrom" type="date" class="filter-input" />
          <span class="date-sep">至</span>
          <input v-model="dateTo" type="date" class="filter-input" />
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">操作类型</label>
        <div class="select-wrapper">
          <select v-model="actionFilter" class="filter-select">
            <option value="all">全部类型</option>
            <option value="create">创建</option>
            <option value="update">更新</option>
            <option value="delete">删除</option>
            <option value="login">登录</option>
            <option value="logout">登出</option>
          </select>
          <svg class="select-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">用户</label>
        <div class="search-box">
          <svg class="search-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input v-model="userFilter" type="text" placeholder="搜索用户..." class="filter-input search-input" />
        </div>
      </div>

      <button v-if="hasActiveFilter" class="clear-btn" @click="clearFilters">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        清除筛选
      </button>
    </div>

    <!-- 日志时间线 -->
    <div class="log-timeline">
      <div v-for="(group, date) in groupedLogs" :key="date" class="log-group">
        <div class="log-date-header">
          <span class="date-label">{{ date }}</span>
          <span class="date-count">{{ group.length }} 条记录</span>
        </div>

        <div class="log-entries">
          <div v-for="log in group" :key="log.id" class="log-entry">
            <div class="log-dot-col">
              <div class="log-dot" :class="'dot-' + log.action"></div>
              <div class="log-line"></div>
            </div>

            <div class="log-card">
              <div class="log-card-top">
                <span class="log-time">{{ log.time }}</span>
                <span class="action-badge" :class="'action-' + log.action">
                  {{ actionLabel(log.action) }}
                </span>
              </div>

              <div class="log-body">
                <div class="log-user">
                  <div class="user-avatar" :style="{ background: log.userColor }">
                    {{ log.user.charAt(0) }}
                  </div>
                  <span class="user-name">{{ log.user }}</span>
                </div>
                <p class="log-desc">{{ log.description }}</p>
              </div>

              <div class="log-meta">
                <span class="meta-item">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="12" height="12">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {{ log.ip }}
                </span>
                <span v-if="log.target" class="meta-item">
                  <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="12" height="12">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {{ log.target }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="Object.keys(groupedLogs).length === 0" class="empty-state">
      <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" width="48" height="48" class="empty-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      <p class="empty-text">未找到匹配的日志记录</p>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'audit-logs' })

useHead({ title: '审计日志' })

const dateFrom = ref('')
const dateTo = ref('')
const actionFilter = ref('all')
const userFilter = ref('')

const hasActiveFilter = computed(() => {
  return dateFrom.value || dateTo.value || actionFilter.value !== 'all' || userFilter.value
})

function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  actionFilter.value = 'all'
  userFilter.value = ''
}

const logs = ref([
  { id: 1, date: '2026-05-03', time: '14:32:18', user: '张伟', userColor: '#6366f1', action: 'create', description: '创建了新用户「王明」', ip: '192.168.1.100', target: '用户管理' },
  { id: 2, date: '2026-05-03', time: '14:15:42', user: '李娜', userColor: '#8b5cf6', action: 'update', description: '更新了应用「主站前端」的回调地址', ip: '192.168.1.101', target: '应用管理' },
  { id: 3, date: '2026-05-03', time: '13:58:07', user: '王芳', userColor: '#14b8a6', action: 'login', description: '通过 SSO 登录系统', ip: '10.0.0.55', target: '' },
  { id: 4, date: '2026-05-03', time: '13:42:33', user: '赵强', userColor: '#f59e0b', action: 'delete', description: '删除了角色「临时访客」', ip: '192.168.1.102', target: '角色权限' },
  { id: 5, date: '2026-05-03', time: '12:30:15', user: '管理员', userColor: '#ec4899', action: 'create', description: '发送了邀请给 chenming@corp.cn', ip: '192.168.1.1', target: '邀请管理' },
  { id: 6, date: '2026-05-03', time: '11:20:08', user: '张伟', userColor: '#6366f1', action: 'update', description: '修改了组织「技术团队」的描述信息', ip: '192.168.1.100', target: '组织管理' },
  { id: 7, date: '2026-05-03', time: '10:05:44', user: '李娜', userColor: '#8b5cf6', action: 'logout', description: '退出系统', ip: '192.168.1.101', target: '' },
  { id: 8, date: '2026-05-02', time: '17:45:22', user: '陈明', userColor: '#6366f1', action: 'login', description: '通过密码登录系统', ip: '10.0.0.88', target: '' },
  { id: 9, date: '2026-05-02', time: '16:33:11', user: '王芳', userColor: '#14b8a6', action: 'create', description: '创建了新组织「数据平台组」', ip: '10.0.0.55', target: '组织管理' },
  { id: 10, date: '2026-05-02', time: '15:20:45', user: '赵强', userColor: '#f59e0b', action: 'update', description: '更新了角色「编辑者」的权限配置', ip: '192.168.1.102', target: '角色权限' },
  { id: 11, date: '2026-05-02', time: '14:10:30', user: '管理员', userColor: '#ec4899', action: 'delete', description: '删除了过期邀请 hexuan@prod.io', ip: '192.168.1.1', target: '邀请管理' },
  { id: 12, date: '2026-05-02', time: '11:55:18', user: '张伟', userColor: '#6366f1', action: 'create', description: '注册了新应用「数据同步服务」', ip: '192.168.1.100', target: '应用管理' },
  { id: 13, date: '2026-05-02', time: '10:22:03', user: '李娜', userColor: '#8b5cf6', action: 'login', description: '通过 OAuth 登录系统', ip: '192.168.1.101', target: '' },
  { id: 14, date: '2026-05-01', time: '18:08:55', user: '陈明', userColor: '#6366f1', action: 'update', description: '更新了用户「孙强」的角色为管理员', ip: '10.0.0.88', target: '用户管理' },
  { id: 15, date: '2026-05-01', time: '16:42:12', user: '王芳', userColor: '#14b8a6', action: 'delete', description: '删除了应用「测试应用-beta」', ip: '10.0.0.55', target: '应用管理' },
  { id: 16, date: '2026-05-01', time: '15:15:38', user: '赵强', userColor: '#f59e0b', action: 'create', description: '创建了新角色「API 审计员」', ip: '192.168.1.102', target: '角色权限' },
  { id: 17, date: '2026-05-01', time: '14:00:27', user: '管理员', userColor: '#ec4899', action: 'update', description: '修改了系统安全策略：密码最小长度改为 12', ip: '192.168.1.1', target: '系统设置' },
  { id: 18, date: '2026-05-01', time: '11:33:44', user: '张伟', userColor: '#6366f1', action: 'login', description: '通过 MFA 验证后登录系统', ip: '192.168.1.100', target: '' },
  { id: 19, date: '2026-05-01', time: '10:18:09', user: '李娜', userColor: '#8b5cf6', action: 'create', description: '批量导入了 32 个用户', ip: '192.168.1.101', target: '用户管理' },
  { id: 20, date: '2026-04-30', time: '17:50:33', user: '陈明', userColor: '#6366f1', action: 'logout', description: '会话超时自动登出', ip: '10.0.0.88', target: '' },
  { id: 21, date: '2026-04-30', time: '16:25:17', user: '王芳', userColor: '#14b8a6', action: 'update', description: '更新了组织「产品部门」的成员列表', ip: '10.0.0.55', target: '组织管理' },
  { id: 22, date: '2026-04-30', time: '14:40:52', user: '赵强', userColor: '#f59e0b', action: 'delete', description: '撤销了对 linjia@tech.net 的邀请', ip: '192.168.1.102', target: '邀请管理' },
  { id: 23, date: '2026-04-30', time: '12:08:26', user: '管理员', userColor: '#ec4899', action: 'create', description: '启用了双因素认证 (2FA) 全局策略', ip: '192.168.1.1', target: '系统设置' },
  { id: 24, date: '2026-04-30', time: '10:55:41', user: '张伟', userColor: '#6366f1', action: 'update', description: '重置了应用「API 网关」的密钥', ip: '192.168.1.100', target: '应用管理' },
  { id: 25, date: '2026-04-30', time: '09:12:05', user: '李娜', userColor: '#8b5cf6', action: 'login', description: '从新设备 Chrome / Windows 登录', ip: '172.16.0.22', target: '' }
])

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (actionFilter.value !== 'all' && log.action !== actionFilter.value) return false
    if (userFilter.value && !log.user.toLowerCase().includes(userFilter.value.toLowerCase())) return false
    if (dateFrom.value && log.date < dateFrom.value) return false
    if (dateTo.value && log.date > dateTo.value) return false
    return true
  })
})

const groupedLogs = computed(() => {
  const groups = {}
  filteredLogs.value.forEach(log => {
    if (!groups[log.date]) groups[log.date] = []
    groups[log.date].push(log)
  })
  return groups
})

function actionLabel(action) {
  const map = { create: '创建', update: '更新', delete: '删除', login: '登录', logout: '登出' }
  return map[action] || action
}

function exportLogs() {
  alert('日志导出功能开发中...')
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Filter Bar ===== */
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 28px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-sep {
  font-size: 12px;
  color: #94a3b8;
}

.filter-input {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s ease;
  width: 140px;
}

.filter-input::placeholder {
  color: #94a3b8;
}

.filter-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  padding-left: 30px;
  width: 160px;
}

.select-wrapper {
  position: relative;
}

.filter-select {
  padding: 8px 32px 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.7);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.filter-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.05);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* ===== Timeline ===== */
.log-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.log-date-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.date-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.date-count {
  font-size: 12px;
  color: #94a3b8;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 6px;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-entry {
  display: flex;
  gap: 16px;
  position: relative;
}

.log-dot-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  flex-shrink: 0;
  padding-top: 18px;
}

.log-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}

.dot-create {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.dot-update {
  background: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.dot-delete {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.dot-login {
  background: #14b8a6;
  box-shadow: 0 0 8px rgba(20, 184, 166, 0.4);
}

.dot-logout {
  background: #94a3b8;
  box-shadow: 0 0 8px rgba(148, 163, 184, 0.3);
}

.log-line {
  width: 2px;
  flex: 1;
  background: rgba(0, 0, 0, 0.06);
  min-height: 8px;
}

.log-entry:last-child .log-line {
  display: none;
}

.log-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.log-card:hover {
  transform: translateX(3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.log-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.log-time {
  font-family: 'Space Grotesk', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.action-badge {
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.action-create {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.action-update {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.action-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-login {
  background: rgba(20, 184, 166, 0.1);
  color: #0d9488;
}

.action-logout {
  background: rgba(148, 163, 184, 0.15);
  color: #64748b;
}

.log-body {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

.log-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #94a3b8;
}

/* ===== Empty State ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
}

/* ===== Responsive ===== */
@media (max-width: 1400px) {
  .filter-bar {
    gap: 12px;
  }
}

@media (max-width: 1024px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .date-range {
    width: 100%;
  }

  .date-range .filter-input {
    flex: 1;
  }

  .search-input {
    width: 100%;
  }

  .clear-btn {
    margin-left: 0;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .log-card {
    padding: 12px 14px;
  }

  .log-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .log-card-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .log-meta {
    flex-wrap: wrap;
    gap: 8px;
  }

  .btn-export {
    width: 100%;
    justify-content: center;
  }
}
</style>
