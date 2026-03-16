<template>
  <div class="design-showcase-glass">
    <div class="showcase-header-glass">
      <h1 class="showcase-title-glass">毛玻璃 + 渐变色现代风格</h1>
      <p class="showcase-subtitle-glass">Glassmorphism + Gradient Modern Style</p>
      <p class="showcase-desc-glass">精致现代、清晰可读、统一协调</p>
    </div>

    <div class="preview-section">
      <div class="preview-card">
        <div class="preview-header">
          <h2 class="preview-title">系统监控预览</h2>
          <span class="preview-tag">完整效果</span>
        </div>

        <!-- 网络状态 -->
        <div class="preview-section">
          <h3 class="section-title">网络状态</h3>
          <div class="glass-network-grid">
            <div class="glass-indicator glass-blue">
              <div class="glass-icon">
                <UIcon name="i-heroicons-arrow-down" class="w-6 h-6" />
              </div>
              <div class="glass-content">
                <span class="glass-value">85.3</span>
                <span class="glass-label">下载 (MB/s)</span>
              </div>
            </div>

            <div class="glass-indicator glass-purple">
              <div class="glass-icon">
                <UIcon name="i-heroicons-arrow-up" class="w-6 h-6" />
              </div>
              <div class="glass-content">
                <span class="glass-value">12.5</span>
                <span class="glass-label">上传 (MB/s)</span>
              </div>
            </div>

            <div class="glass-indicator glass-green">
              <div class="glass-icon">
                <UIcon name="i-heroicons-signal" class="w-6 h-6" />
              </div>
              <div class="glass-content">
                <span class="glass-value">24</span>
                <span class="glass-label">延迟 (ms)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 硬件监控 -->
        <div class="preview-section">
          <h3 class="section-title">硬件监控</h3>
          <div class="glass-hardware-grid">
            <div class="glass-chart glass-chart-blue">
              <div class="glass-chart-header">
                <UIcon name="i-heroicons-cpu-chip" class="w-5 h-5" />
                <span class="glass-chart-label">CPU</span>
                <span class="glass-chart-value">45%</span>
              </div>
              <div class="glass-chart-body">
                <svg class="glass-svg" viewBox="0 0 280 60">
                  <defs>
                    <linearGradient id="glass-gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 40 Q 40 20 T 70 30 T 100 25 T 130 35 T 160 30 T 190 25 T 220 35 T 250 30"
                    stroke="url(#glass-gradient-blue)"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>

            <div class="glass-chart glass-chart-purple">
              <div class="glass-chart-header">
                <UIcon name="i-heroicons-server" class="w-5 h-5" />
                <span class="glass-chart-label">内存</span>
                <span class="glass-chart-value">62%</span>
              </div>
              <div class="glass-chart-body">
                <svg class="glass-svg" viewBox="0 0 280 60">
                  <defs>
                    <linearGradient id="glass-gradient-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.05"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 35 Q 40 45 T 70 30 T 100 35 T 130 25 T 160 40 T 190 30 T 220 35 T 250 30"
                    stroke="url(#glass-gradient-purple)"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>

            <div class="glass-chart glass-chart-green">
              <div class="glass-chart-header">
                <UIcon name="i-heroicons-circle-stack" class="w-5 h-5" />
                <span class="glass-chart-label">硬盘</span>
                <span class="glass-chart-value">38%</span>
              </div>
              <div class="glass-chart-body">
                <svg class="glass-svg" viewBox="0 0 280 60">
                  <defs>
                    <linearGradient id="glass-gradient-green" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10 45 Q 40 42 T 70 40 T 100 45 T 130 38 T 160 42 T 190 40 T 220 45 T 250 40"
                    stroke="url(#glass-gradient-green)"
                    stroke-width="3"
                    fill="none"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="style-details">
      <div class="detail-section">
        <h2 class="detail-title">设计特点</h2>
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-icon">🪟</div>
            <div class="detail-content">
              <h3 class="detail-name">毛玻璃效果</h3>
              <p class="detail-desc">半透明背景 + 背景模糊 + 白色边框</p>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">🌈</div>
            <div class="detail-content">
              <h3 class="detail-name">渐变色彩</h3>
              <p class="detail-desc">蓝紫绿主题色 + 渐变填充图表</p>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">✨</div>
            <div class="detail-content">
              <h3 class="detail-name">现代感</h3>
              <p class="detail-desc">圆角设计 + 柔和阴影 + 流畅动画</p>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">👁️</div>
            <div class="detail-content">
              <h3 class="detail-name">高可读性</h3>
              <p class="detail-desc">深色文字 + 高对比度 + 清晰层次</p>
            </div>
          </div>
        </div>
      </div>

      <div class="color-section">
        <h2 class="color-title">配色方案</h2>
        <div class="color-palette">
          <div class="color-item">
            <div class="color-swatch" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"></div>
            <span class="color-name">背景渐变</span>
            <span class="color-code">#667eea → #764ba2</span>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: rgba(255, 255, 255, 0.25)"></div>
            <span class="color-name">卡片背景</span>
            <span class="color-code">rgba(255,255,255, 0.25)</span>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #ffffff"></div>
            <span class="color-name">文字颜色</span>
            <span class="color-code">#ffffff</span>
          </div>
          <div class="color-item">
            <div class="color-swatch" style="background: #3b82f6"></div>
            <span class="color-name">蓝色主题</span>
            <span class="color-code">#3b82f6</span>
          </div>
        </div>
      </div>
    </div>

    <div class="action-section">
      <h2 class="action-title">应用这个风格？</h2>
      <div class="action-buttons">
        <button class="action-button primary" @click="applyStyle">
          <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
          是的，应用毛玻璃风格
        </button>
        <button class="action-button secondary" @click="goBack">
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          再看看其他风格
        </button>
      </div>
      <p class="action-note">💡 这个风格将应用到完整的 Dashboard，包括所有卡片、图表和交互效果</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRouter()

const applyStyle = () => {
  // 将应用毛玻璃风格
  navigateTo('/?style=glassmorphism')
}

const goBack = () => {
  navigateTo('/design-showcase')
}
</script>

<style scoped>
.design-showcase-glass {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3rem 2rem;
  position: relative;
}

/* 添加动态背景装饰 */
.design-showcase-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.showcase-header-glass {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
}

.showcase-title-glass {
  font-size: 3rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.showcase-subtitle-glass {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.showcase-desc-glass {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.preview-section {
  max-width: 900px;
  margin: 0 auto 3rem;
  position: relative;
  z-index: 1;
}

.preview-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
}

.preview-tag {
  font-size: 0.875rem;
  padding: 0.375rem 0.875rem;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 1rem;
  font-weight: 600;
}

.preview-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  letter-spacing: 0.025em;
}

/* 网络状态 - 毛玻璃卡片 */
.glass-network-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.glass-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-indicator:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.glass-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.glass-blue .glass-icon {
  background: rgba(59, 130, 246, 0.25);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.glass-purple .glass-icon {
  background: rgba(139, 92, 246, 0.25);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

.glass-green .glass-icon {
  background: rgba(16, 185, 129, 0.25);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.glass-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.glass-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.glass-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* 硬件监控 - 毛玻璃图表 */
.glass-hardware-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.glass-chart {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.glass-chart-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.glass-chart-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
}

.glass-chart-value {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
}

.glass-chart-blue .glass-chart-value {
  color: #60a5fa;
}

.glass-chart-purple .glass-chart-value {
  color: #a78bfa;
}

.glass-chart-green .glass-chart-value {
  color: #34d399;
}

.glass-chart-body {
  height: 60px;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  overflow: hidden;
}

.glass-svg {
  width: 100%;
  height: 100%;
}

/* 详细说明区域 */
.style-details {
  max-width: 900px;
  margin: 0 auto 3rem;
  position: relative;
  z-index: 1;
}

.detail-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.detail-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
}

.detail-name {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.detail-desc {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

/* 配色方案 */
.color-section {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border: 1ess than1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.color-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
}

.color-swatch {
  width: 100%;
  height: 3rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.color-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.color-code {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
}

/* 操作区域 */
.action-section {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.action-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: #ffffff;
  color: #667eea;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-button.primary:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.action-button.secondary {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.25);
}

.action-note {
  text-align: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-note p {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .design-showcase-glass {
    padding: 2rem 1rem;
  }

  .showcase-title-glass {
    font-size: 2rem;
  }

  .glass-network-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
