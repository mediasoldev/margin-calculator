<!-- frontend/src/components/pages/HomePageComponent.vue -->

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <a-card class="hero-card">
      <div class="hero-content">
        <h1 class="hero-title">
          <CalculatorOutlined class="hero-icon" />
          {{ $t('home.title') }}
        </h1>
        <p class="hero-description">
          {{ $t('home.description') }}
        </p>
      </div>
    </a-card>

    <!-- Features -->
    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :xs="24" :md="12" :lg="6">
        <a-card hoverable>
          <a-statistic
            :title="$t('home.features.priceCalc')"
            :value="100"
            :precision="0"
            suffix="%"
            :value-style="{ color: '#3f8600' }"
          >
            <template #prefix>
              <CalculatorOutlined />
            </template>
          </a-statistic>
          <p class="feature-desc">{{ $t('home.features.priceCalcDesc') }}</p>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :md="12" :lg="6">
        <a-card hoverable>
          <a-statistic
            :title="$t('home.features.currency')"
            value="PLN/USD/EUR"
            :value-style="{ color: '#1890ff', fontSize: '20px' }"
          >
            <template #prefix>
              <DollarOutlined />
            </template>
          </a-statistic>
          <p class="feature-desc">{{ $t('home.features.currencyDesc') }}</p>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :md="12" :lg="6">
        <a-card hoverable>
          <a-statistic
            :title="$t('home.features.suppliers')"
            :value="supplierCount"
            :value-style="{ color: '#722ed1' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
          <p class="feature-desc">{{ $t('home.features.suppliersDesc') }}</p>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :md="12" :lg="6">
        <a-card hoverable>
          <a-statistic
            :title="$t('home.features.integration')"
            value="Bitrix24"
            :value-style="{ color: '#fa8c16', fontSize: '20px' }"
          >
            <template #prefix>
              <ApiOutlined />
            </template>
          </a-statistic>
          <p class="feature-desc">{{ $t('home.features.integrationDesc') }}</p>
        </a-card>
      </a-col>
    </a-row>

    <!-- How to Use -->
    <a-card style="margin-top: 24px" :title="$t('home.howToUse.title')">
      <a-steps direction="vertical" :current="-1">
        <a-step>
          <template #title>{{ $t('home.howToUse.step1.title') }}</template>
          <template #description>
            <div class="step-content">
              {{ $t('home.howToUse.step1.description') }}
            </div>
          </template>
          <template #icon><SettingOutlined /></template>
        </a-step>
        
        <a-step>
          <template #title>{{ $t('home.howToUse.step2.title') }}</template>
          <template #description>
            <div class="step-content">
              {{ $t('home.howToUse.step2.description') }}
              <br />
              <a-typography-text type="secondary" style="font-size: 12px">
                {{ $t('home.howToUse.step2.note') }}
              </a-typography-text>
            </div>
          </template>
          <template #icon><FileTextOutlined /></template>
        </a-step>
        
        <a-step>
          <template #title>{{ $t('home.howToUse.step3.title') }}</template>
          <template #description>
            <div class="step-content">
              {{ $t('home.howToUse.step3.description') }}
            </div>
          </template>
          <template #icon><CalculatorOutlined /></template>
        </a-step>
        
        <a-step>
          <template #title>{{ $t('home.howToUse.step4.title') }}</template>
          <template #description>
            <div class="step-content">
              {{ $t('home.howToUse.step4.description') }}
            </div>
          </template>
          <template #icon><SaveOutlined /></template>
        </a-step>
      </a-steps>
    </a-card>

    <!-- Info Cards -->
    <a-row :gutter="[16, 16]" style="margin-top: 24px">
      <a-col :xs="24" :lg="12">
        <a-card :title="$t('home.info.whereToFind.title')">
          <a-alert
            :message="$t('home.info.whereToFind.message')"
            type="info"
            show-icon
          />
          <div style="margin-top: 16px">
            <a-typography-paragraph>
              <ol>
                <li>{{ $t('home.info.whereToFind.step1') }}</li>
                <li>{{ $t('home.info.whereToFind.step2') }}</li>
                <li>{{ $t('home.info.whereToFind.step3') }}</li>
              </ol>
            </a-typography-paragraph>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :lg="12">
        <a-card :title="$t('home.info.features.title')">
          <a-list size="small">
            <a-list-item>
              <CheckCircleOutlined style="color: #52c41a; margin-right: 8px" />
              {{ $t('home.info.features.item1') }}
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined style="color: #52c41a; margin-right: 8px" />
              {{ $t('home.info.features.item2') }}
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined style="color: #52c41a; margin-right: 8px" />
              {{ $t('home.info.features.item3') }}
            </a-list-item>
            <a-list-item>
              <CheckCircleOutlined style="color: #52c41a; margin-right: 8px" />
              {{ $t('home.info.features.item4') }}
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>

    <!-- Quick Actions -->
    <a-card style="margin-top: 24px" :title="$t('home.quickActions.title')">
      <a-space wrap :size="16">
        <a-button 
          type="primary" 
          size="large"
          @click="goToSettings"
        >
          <SettingOutlined />
          {{ $t('home.quickActions.settings') }}
        </a-button>
        
        <a-button 
          size="large"
          @click="testWidget"
          :loading="testingWidget"
        >
          <ExperimentOutlined />
          {{ $t('home.quickActions.testWidget') }}
        </a-button>
        
        <a-button 
          size="large"
          @click="viewDocumentation"
        >
          <BookOutlined />
          {{ $t('home.quickActions.documentation') }}
        </a-button>
      </a-space>
    </a-card>

    <!-- Status -->
    <a-card style="margin-top: 24px">
      <a-descriptions :title="$t('home.status.title')" bordered>
        <a-descriptions-item :label="$t('home.status.appVersion')">
          <a-tag color="blue">v1.0.0</a-tag>
        </a-descriptions-item>
        <a-descriptions-item :label="$t('home.status.bitrixConnection')">
          <a-badge :status="bx24.isReady ? 'success' : 'error'" :text="bx24.isReady ? $t('home.status.connected') : $t('home.status.disconnected')" />
        </a-descriptions-item>
        <a-descriptions-item :label="$t('home.status.user')">
          {{ appStore.userName || 'Guest' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('home.status.domain')">
          {{ appStore.domain || 'localhost' }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('home.status.language')">
          {{ currentLanguage }}
        </a-descriptions-item>
        <a-descriptions-item :label="$t('home.status.lastSync')">
          {{ lastSyncTime }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useBX24 } from '@/composables/useBX24'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import {
  CalculatorOutlined,
  DollarOutlined,
  TeamOutlined,
  ApiOutlined,
  SettingOutlined,
  FileTextOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  BookOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const { t, locale } = useI18n()
const appStore = useAppStore()
const bx24 = useBX24()

// State
const testingWidget = ref(false)
const supplierCount = ref(0)
const lastSyncTime = ref(dayjs().format('YYYY-MM-DD HH:mm'))

// Computed
const currentLanguage = computed(() => {
  const languages: Record<string, string> = {
    'en': 'English',
    'ua': 'Українська',
    'ru': 'Русский',
    'pl': 'Polski'
  }
  return languages[locale.value] || 'English'
})

// Methods
const goToSettings = () => {
  router.push('/settings')
}

const testWidget = async () => {
  testingWidget.value = true
  try {
    // Open widget in new window for testing
    const widgetUrl = `${window.location.origin}/pricing-calculator`
    window.open(widgetUrl, 'PricingWidget', 'width=1200,height=800')
    message.success(t('home.messages.widgetOpened'))
  } catch (error) {
    message.error(t('home.messages.widgetError'))
  } finally {
    testingWidget.value = false
  }
}

const viewDocumentation = () => {
  message.info(t('home.messages.documentationComingSoon'))
}

// Lifecycle
onMounted(async () => {
  // Load supplier count
  try {
    // TODO: Replace with actual API call
    supplierCount.value = 12
  } catch (error) {
    console.error('Failed to load supplier count:', error)
  }
})
</script>

<style scoped>
.home-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
  color: white;
}

.hero-card :deep(.ant-card-body) {
  padding: 48px;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  color: white;
}

.hero-icon {
  font-size: 40px;
  margin-right: 16px;
}

.hero-description {
  font-size: 18px;
  opacity: 0.95;
  max-width: 800px;
  margin: 0 auto;
  color: white;
}

.feature-desc {
  margin-top: 8px;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.step-content {
  max-width: 600px;
  color: var(--text-color);
}

/* Dark mode adjustments */
:global(.dark) .hero-card {
  background: linear-gradient(135deg, var(--primary-color) 0%, rgba(114, 46, 209, 0.8) 100%);
}

:global(.dark) .ant-card {
  border-color: #303030;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .home-page {
    padding: 16px;
  }
  
  .hero-card :deep(.ant-card-body) {
    padding: 24px;
  }
  
  .hero-title {
    font-size: 24px;
  }
  
  .hero-description {
    font-size: 14px;
  }
  
  .hero-icon {
    font-size: 28px;
    display: block;
    margin: 0 auto 16px;
  }
}
</style>