<template>
  <div class="design-showcase">
    <div class="showcase-header">
      <h1 class="showcase-title">Dashboard 设计风格展示（优化版）</h1>
      <p class="showcase-subtitle">更协调、更清晰、更统一的设计方案</p>
    </div>

    <div class="showcase-grid">
      <!-- 风格1：现代清新 -->
      <div class="style-card style-fresh">
        <div class="style-header">
          <div class="style-icon">🌿</div>
          <h3 class="style-name">现代清新</h3>
          <span class="style-tag">Modern Fresh</span>
        </div>
        <div class="style-demo">
          <div class="demo-network">
            <div class="demo-indicator demo-indicator-1">
              <span class="demo-icon">↓</span>
              <span class="demo-value">85.3</span>
              <span class="demo-label">下载</span>
            </div>
            <div class="demo-indicator demo-indicator-2">
              <span class="demo-icon">↑</span>
              <span class="demo-value">12.5</span>
              <span class="demo-label">上传</span>
            </div>
            <div class="demo-indicator demo-indicator-3">
              <span class="demo-icon">⚡</span>
              <span class="demo-value">24</span>
              <span class="demo-label">延迟</span>
            </div>
          </div>
          <div class="demo-chart">
            <div class="demo-chart-line"></div>
          </div>
        </div>
        <div class="style-features">
          <span class="feature">清新配色</span>
          <span class="feature">柔和对比</span>
          <span class="feature">现代感</span>
        </div>
      </div>

      <!-- 风格2：专业数据 -->
      <div class="style-card style-data">
        <div class="style-header">
          <div class="style-icon">📊</div>
          <h3 class="style-name">专业数据</h3>
          <span class="style-tag">Data Pro</span>
        </div>
        <div class="style-demo">
          <div class="demo-network-data">
            <div class="demo-indicator-data demo-data-1">
              <span class="demo-icon-data">↓</span>
              <div class="demo-info-data">
                <span class="demo-value-data">85.3 MB/s</span>
                <span class="demo-label-data">下载速度</span>
              </div>
            </div>
            <div class="demo-indicator-data demo-data-2">
              <span class="demo-icon-data">↑</span>
              <div class="demo-info-data">
                <span class="demo-value-data">12.5 MB/s</span>
                <span class="demo-label-data">上传速度</span>
              </div>
            </div>
            <div class="demo-indicator-data demo-data-3">
              <span class="demo-icon-data">⚡</span>
              <div class="demo-info-data">
                <span class="demo-value-data">24 ms</span>
                <span class="demo-label-data">网络延迟</span>
              </div>
            </div>
          </div>
          <div class="demo-chart-data">
            <div class="demo-chart-line-data"></div>
          </div>
        </div>
        <div class="style-features">
          <span class="feature">数据清晰</span>
          <span class="feature">专业图表</span>
          <span class="feature">高对比度</span>
        </div>
      </div>

      <!-- 风格3：温和商务 -->
      <div class="style-card style-gentle">
        <div class="style-header">
          <div class="style-icon">🏢</div>
          <h3 class="style-name">温和商务</h3>
          <span class="style-tag">Gentle Business</span>
        </div>
        <div class="style-demo">
          <div class="demo-network-gentle">
            <div class="demo-indicator-gentle demo-gentle-1">
              <span class="demo-icon-gentle">↓</span>
              <span class="demo-value-gentle">85.3</span>
              <span class="demo-label-gentle">下载</span>
            </div>
            <div class="demo-indicator-gentle demo-gentle-2">
              <span class="demo-icon-gentle">↑</span>
              <span class="demo-value-gentle">12.5</span>
              <span class="demo-label-gentle">上传</span>
            </div>
            <div class="demo-indicator-gentle demo-gentle-3">
              <span class="demo-icon-gentle">⚡</span>
              <span class="demo-value-gentle">24</span>
              <span class="demo-label-gentle">延迟</span>
            </div>
          </div>
          <div class="demo-chart-gentle">
            <div class="demo-chart-line-gentle"></div>
          </div>
        </div>
        <div class="style-features">
          <span class="feature">稳重配色</span>
          <span class="feature">商务风格</span>
          <span class="feature">易读性强</span>
        </div>
      </div>

      <!-- 风格4：活力色彩 -->
      <div class="style-card style-vibrant">
        <div class="style-header">
          <div class="style-icon">🎨</div>
          <h3 class="style-name">活力色彩</h3>
          <span class="style-tag">Vibrant</span>
        </div>
        <div class="style-demo">
          <div class="demo-network-vibrant">
            <div class="demo-indicator-vibrant demo-vibrant-1">
              <span class="demo-icon-vibrant">↓</span>
              <span class="demo-value-vibrant">85.3</span>
              <span class="demo-label-vibrant">下载</span>
            </div>
            <div class="demo-indicator-vibrant demo-vibrant-2">
              <span class="demo-icon-vibrant">↑</span>
              <span class="demo-value-vibrant">12.5</span>
              <span class="demo-label-vibrant">上传</span>
            </div>
            <div class="demo-indicator-vibrant demo-vibrant-3">
              <span class="demo-icon-vibrant">⚡</span>
              <span class="demo-value-vibrant">24</span>
              <span class="demo-label-vibrant">延迟</span>
            </div>
          </div>
          <div class="demo-chart-vibrant">
            <div class="demo-chart-line-vibrant"></div>
          </div>
        </div>
        <div class="style-features">
          <span class="feature">丰富色彩</span>
          <span class="feature">活力四射</span>
          <span class="feature">年轻化</span>
        </div>
      </div>
    </div>

    <div class="style-selection">
      <h2 class="selection-title">选择您喜欢的风格</h2>
      <div class="selection-options">
        <button
          v-for="style in styles"
          :key="style.id"
          @click="selectStyle(style.id)"
          :class="['style-button', { 'active': selectedStyle === style.id }]"
        >
          {{ style.name }}
        </button>
      </div>
      <div class="selection-note">
        <p>💡 选择风格后，我会将相应的设计应用到完整的 Dashboard 界面</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedStyle = ref('fresh')

const styles = [
  { id: 'fresh', name: '现代清新' },
  { id: 'data', name: '专业数据' },
  { id: 'gentle', name: '温和商务' },
  { id: 'vibrant', name: '活力色彩' }
]

const selectStyle = (styleId: string) => {
  selectedStyle.value = styleId
}
</script>

<style scoped>
.design-showcase {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
}

.showcase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.showcase-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.showcase-subtitle {
  font-size: 1.125rem;
  color: #64748b;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.style-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.style-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.style-header {
  text-align: center;
  margin-bottom: 2rem;
}

.style-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.style-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.style-tag {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.style-demo {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.style-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.feature {
  font-size: 0.8125rem;
  padding: 0.375rem 0.875rem;
  background: #f1f5f9;
  border-radius: 1.5rem;
  color: #475569;
  font-weight: 500;
}

/* 现代清新风格 */
.style-fresh {
  border-color: #7dd3fc;
}

.style-fresh .style-icon {
  filter: drop-shadow(0 2px 4px rgba(14, 165, 233, 0.3));
}

.demo-network {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.demo-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: #ffffff;
  border: 2px solid #e0f2fe;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.demo-indicator:hover {
  border-color: #7dd3fc;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
}

.demo-icon {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.demo-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0e7490;
  line-height: 1;
}

.demo-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.demo-chart {
  height: 100px;
  background: #ffffff;
  border: 2px solid #e0f2fe;
  border-radius: 0.75rem;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(14, 165, 233, 0.05);
}

.demo-chart-line {
  position: absolute;
  top: 50%;
  left: 8%;
  right: 8%;
  height: 3px;
  background: linear-gradient(90deg, #0ea5e9, #06b6d4, #14b8a6);
  border-radius: 1.5px;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
}

/* 专业数据风格 */
.style-data {
  border-color: #6366f1;
}

.demo-network-data {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.demo-indicator-data {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #6366f1;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.demo-indicator-data:nth-child(2) {
  border-left-color: #8b5cf6;
}

.demo-indicator-data:nth-child(3) {
  border-left-color: #10b981;
}

.demo-icon-data {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.demo-info-data {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.demo-value-data {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.demo-label-data {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.demo-chart-data {
  height: 100px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
}

.demo-chart-line-data {
  position: absolute;
  top: 50%;
  left: 3%;
  right: 3%;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #10b981);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* 温和商务风格 */
.style-gentle {
  border-color: #94a3b8;
}

.demo-network-gentle {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.demo-indicator-gentle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #cbd5e1;
  border-radius: 0.625rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.demo-icon-gentle {
  font-size: 1.5rem;
  color: #475569;
}

.demo-value-gentle {
  font-size: 1.125rem;
  font-weight: 700;
  color: #334155;
}

.demo-label-gentle {
  font-size: 0.8125rem;
  color: #64748b;
  font-weight: 500;
}

.demo-chart-gentle {
  height: 100px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #cbd5e1;
  border-radius: 0.625rem;
  position: relative;
  overflow: hidden;
}

.demo-chart-line-gentle {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 3px;
  background: linear-gradient(90deg, #475569, #64748b, #94a3b8);
  border-radius: 1.5px;
}

/* 活力色彩风格 */
.style-vibrant {
  border-color: #fb923c;
}

.demo-network-vibrant {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.demo-indicator-vibrant {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: #ffffff;
  border: 3px solid #fed7aa;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(251, 146, 60, 0.1);
}

.demo-indicator-vibrant:nth-child(2) {
  border-color: #c4b5fd;
  box-shadow: 0 4px 6px rgba(167, 139, 250, 0.1);
}

.demo-indicator-vibrant:nth-child(3) {
  border-color: #86efac;
  box-shadow: 0 4px 6px rgba(52, 211, 153, 0.1);
}

.demo-icon-vibrant {
  font-size: 1.75rem;
}

.demo-value-vibrant {
  font-size: 1.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-indicator-vibrant:nth-child(2) .demo-value-vibrant {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-indicator-vibrant:nth-child(3) .demo-value-vibrant {
  background: linear-gradient(135deg, #10b981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.demo-label-vibrant {
  font-size: 0.875rem;
  color: #78716c;
  font-weight: 600;
}

.demo-chart-vibrant {
  height: 100px;
  background: #fff7ed;
  border: 3px solid #fed7aa;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(251, 146, 60, 0.1);
}

.demo-chart-line-vibrant {
  position: absolute;
  top: 50%;
  left: 8%;
  right: 8%;
  height: 4px;
  background: linear-gradient(90deg, #f97316, #a855f7, #10b981);
  border-radius: 2px;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.4);
}

/* 选择区域 */
.style-selection {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.selection-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  margin-bottom: 1.5rem;
}

.selection-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.style-button {
  padding: 0.875rem 1.75rem;
  background: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.style-button:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.style-button.active {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.selection-note {
  text-align: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.selection-note p {
  font-size: 0.9375rem;
  color: #1e40af;
  margin: 0;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .design-showcase {
    padding: 1rem;
  }

  .showcase-title {
    font-size: 1.75rem;
  }

  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .demo-network {
    grid-template-columns: 1fr;
  }

  .demo-network-gentle {
    grid-template-columns: 1fr;
  }

  .demo-network-vibrant {
    grid-template-columns: 1fr;
  }
}
</style>
