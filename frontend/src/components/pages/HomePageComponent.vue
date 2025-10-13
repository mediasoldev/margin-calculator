<!-- frontend/src/components/pages/HomePageComponent.vue -->

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <a-card class="hero-card">
      <div class="hero-content">
        <!-- <div class="hero-icon-wrapper">
          <CalculatorOutlined class="hero-icon" />
        </div> -->
        <h1 class="hero-title">
          {{ $t('home.title') }}
        </h1>
        <p class="hero-description">
          {{ $t('home.description') }}
        </p>
      </div>
    </a-card>

    <!-- Important Notice -->
    <a-alert
      style="margin-top: 24px"
      type="warning"
      show-icon
      :message="$t('home.importantNotice')"
      :description="$t('home.noticeDescription')"
    />

    <!-- Where to Find Widget -->
    <a-card style="margin-top: 24px" :title="$t('home.whereToFind.title')">
      <a-steps :current="-1" direction="vertical" size="small">
        <a-step>
          <template #title>{{ $t('home.whereToFind.step1') }}</template>
          <template #icon>
            <div class="step-icon">1</div>
          </template>
        </a-step>
        <a-step>
          <template #title>{{ $t('home.whereToFind.step2') }}</template>
          <template #icon>
            <div class="step-icon">2</div>
          </template>
        </a-step>
        <a-step>
          <template #title>{{ $t('home.whereToFind.step3') }}</template>
          <template #icon>
            <div class="step-icon">3</div>
          </template>
        </a-step>
      </a-steps>
    </a-card>

    <!-- Key Features -->
    <a-card style="margin-top: 24px" :title="$t('home.keyFeatures.title')">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :lg="6">
          <div class="feature-item">
            <div class="feature-icon">
              <DollarOutlined />
            </div>
            <h4 class="feature-title">{{ $t('home.keyFeatures.currencies') }}</h4>
            <p class="feature-desc">{{ $t('home.keyFeatures.currenciesDesc') }}</p>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="feature-item">
            <div class="feature-icon">
              <CalculatorOutlined />
            </div>
            <h4 class="feature-title">{{ $t('home.keyFeatures.margin') }}</h4>
            <p class="feature-desc">{{ $t('home.keyFeatures.marginDesc') }}</p>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="feature-item">
            <div class="feature-icon">
              <TeamOutlined />
            </div>
            <h4 class="feature-title">{{ $t('home.keyFeatures.suppliers') }}</h4>
            <p class="feature-desc">{{ $t('home.keyFeatures.suppliersDesc') }}</p>
          </div>
        </a-col>

        <a-col :xs="24" :sm="12" :lg="6">
          <div class="feature-item">
            <div class="feature-icon">
              <SettingOutlined />
            </div>
            <h4 class="feature-title">{{ $t('home.keyFeatures.flexible') }}</h4>
            <p class="feature-desc">{{ $t('home.keyFeatures.flexibleDesc') }}</p>
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {
  CalculatorOutlined,
  DollarOutlined,
  TeamOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
</script>

<style scoped>
.home-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Card */
.hero-card {
  background: linear-gradient(135deg, var(--primary-color, #1677ff) 0%, var(--primary-color, #1677ff) 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-card :deep(.ant-card-body) {
  padding: 48px 24px;
}

.hero-content {
  text-align: center;
  color: white;
}

.hero-icon-wrapper {
  margin-bottom: 24px;
}

.hero-icon {
  font-size: 64px;
  color: white;
  opacity: 0.95;
}

.hero-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  color: white;
}

.hero-description {
  font-size: 16px;
  opacity: 0.95;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  color: white;
}

/* Steps */
.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-color, #1677ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

:deep(.ant-steps-item-title) {
  font-size: 15px;
  color: var(--text-color);
}

/* Features */
.feature-item {
  text-align: center;
  padding: 24px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: var(--feature-bg, transparent);
}

.feature-item:hover {
  background: var(--feature-hover-bg, rgba(0, 0, 0, 0.02));
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 36px;
  color: var(--primary-color, #1677ff);
  margin-bottom: 16px;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.feature-desc {
  font-size: 13px;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Dark mode */
:global(html.dark) .hero-card {
  background: linear-gradient(135deg, var(--primary-color, #1677ff) 0%, rgba(22, 119, 255, 0.8) 100%);
}

:global(html.dark) .feature-item {
  --feature-bg: transparent;
  --feature-hover-bg: rgba(255, 255, 255, 0.05);
}

:global(html.dark) .ant-card {
  background-color: #1f1f1f;
  border-color: #303030;
}

:global(html.dark) :deep(.ant-alert-warning) {
  background-color: rgba(250, 173, 20, 0.1);
  border-color: rgba(250, 173, 20, 0.3);
}

/* Light mode */
:global(html.light) .feature-item {
  --feature-bg: transparent;
  --feature-hover-bg: rgba(0, 0, 0, 0.02);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }
  
  .hero-card :deep(.ant-card-body) {
    padding: 32px 16px;
  }
  
  .hero-icon {
    font-size: 48px;
  }
  
  .hero-title {
    font-size: 24px;
  }
  
  .hero-description {
    font-size: 14px;
  }

  .feature-item {
    padding: 16px 12px;
  }

  .feature-icon {
    font-size: 28px;
  }
}

/* Smooth transitions for theme changes */
.hero-card,
.feature-item,
.ant-card {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>