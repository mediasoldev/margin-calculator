<!-- frontend/src/components/pages/AboutPageComponent.vue -->

<template>
  <div class="about-page">
    <!-- Header -->
    <div class="about-header">
      <h1 class="about-title">
        <CalculatorOutlined />
        {{ $t('about.title') }}
      </h1>
      <p class="about-description">
        {{ $t('about.description') }}
      </p>
    </div>

    <!-- FAQ Section -->
    <a-card style="margin-top: 24px">
      <a-collapse 
        v-model:activeKey="activeKey" 
        accordion
        ghost
      >
        <a-collapse-panel 
          key="1" 
          :header="$t('about.faq.item1.question')"
        >
          <p>{{ $t('about.faq.item1.answer') }}</p>
        </a-collapse-panel>
        
        <a-collapse-panel 
          key="2" 
          :header="$t('about.faq.item2.question')"
        >
          <p>{{ $t('about.faq.item2.answer') }}</p>
        </a-collapse-panel>
        
        <a-collapse-panel 
          key="3" 
          :header="$t('about.faq.item3.question')"
        >
          <p>{{ $t('about.faq.item3.answer') }}</p>
        </a-collapse-panel>
        
        <a-collapse-panel 
          key="4" 
          :header="$t('about.faq.item4.question')"
        >
          <p>{{ $t('about.faq.item4.answer') }}</p>
        </a-collapse-panel>
        
        <a-collapse-panel 
          key="5" 
          :header="$t('about.faq.item5.question')"
        >
          <p>{{ $t('about.faq.item5.answer') }}</p>
        </a-collapse-panel>
      </a-collapse>
    </a-card>

    <!-- Version Info -->
    <a-card style="margin-top: 24px">
      <a-descriptions :title="$t('about.info.title')" :column="{ xs: 1, sm: 2, md: 2 }">
        <a-descriptions-item :label="$t('about.info.version')">
          <a-tag color="blue">1.0.0</a-tag>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('about.info.lastUpdate')">
          {{ lastUpdate }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('about.info.developer')">
          {{ $t('about.info.developerName') }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('about.info.support')">
          <a href="mailto:support@example.com">support@example.com</a>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CalculatorOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

// State
const activeKey = ref(['1'])
const lastUpdate = ref(dayjs().format('YYYY-MM-DD'))
</script>

<style scoped>
.about-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 40px;
}

.about-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
}

.about-title .anticon {
  margin-right: 12px;
  color: var(--primary-color);
}

.about-description {
  font-size: 16px;
  color: var(--text-color-secondary);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

:deep(.ant-collapse-header) {
  font-weight: 500;
  font-size: 15px;
}

:deep(.ant-collapse-content-box) {
  color: var(--text-color);
  line-height: 1.6;
}

/* Dark mode */
:global(.dark) .about-header {
  color: rgba(255, 255, 255, 0.85);
}

/* Mobile */
@media (max-width: 768px) {
  .about-page {
    padding: 16px;
  }
  
  .about-title {
    font-size: 24px;
  }
  
  .about-description {
    font-size: 14px;
  }
}
</style>