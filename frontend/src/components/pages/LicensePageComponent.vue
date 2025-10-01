<!-- frontend/src/components/pages/LicensePageComponent.vue -->

<template>
  <div>
    <a-page-header
      :title="$t('license.title')"
      :sub-title="$t('license.subtitle')"
    />
    
    <a-card style="margin-top: 24px">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="current" :tab="$t('license.currentLicense')">
          <a-descriptions bordered :column="{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }">
            <a-descriptions-item :label="$t('license.status')">
              <a-badge :status="licenseStatus" :text="licenseStatusText" />
            </a-descriptions-item>
            <a-descriptions-item :label="$t('license.type')">
              {{ licenseType }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('license.validFrom')">
              {{ formatDate(licenseValidFrom) }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('license.validUntil')">
              {{ formatDate(licenseValidUntil) }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('license.domain')" :span="2">
              {{ appStore.domain || 'localhost' }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('license.users')" :span="2">
              {{ licenseUsers }}
            </a-descriptions-item>
          </a-descriptions>
          
          <a-divider />
          
          <a-space>
            <a-button type="primary" @click="checkLicense" :loading="checkingLicense">
              <ReloadOutlined /> {{ $t('license.checkLicense') }}
            </a-button>
            <a-button @click="showActivationModal">
              <KeyOutlined /> {{ $t('license.activateLicense') }}
            </a-button>
          </a-space>
        </a-tab-pane>
        
        <a-tab-pane key="terms" :tab="$t('license.terms')">
          <a-typography>
            <a-typography-title :level="4">{{ $t('license.termsTitle') }}</a-typography-title>
            <a-typography-paragraph>
              <div v-html="$t('license.termsContent')"></div>
            </a-typography-paragraph>
          </a-typography>
        </a-tab-pane>
      </a-tabs>
    </a-card>
    
    <!-- License Activation Modal -->
    <a-modal
      v-model:open="activationModalVisible"
      :title="$t('license.activateLicense')"
      @ok="activateLicense"
      :confirm-loading="activatingLicense"
    >
      <a-form layout="vertical">
        <a-form-item :label="$t('license.licenseKey')" required>
          <a-input
            v-model:value="licenseKey"
            :placeholder="$t('license.enterLicenseKey')"
            size="large"
          />
        </a-form-item>
        <a-alert
          :message="$t('license.activationNote')"
          type="info"
          show-icon
        />
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { KeyOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const { t } = useI18n()
const appStore = useAppStore()

// State
const activeKey = ref('current')
const activationModalVisible = ref(false)
const licenseKey = ref('')
const checkingLicense = ref(false)
const activatingLicense = ref(false)

// Mock license data (замініть на реальні дані з API)
const licenseStatus = ref<'success' | 'error' | 'warning' | 'processing'>('success')
const licenseType = ref('Professional')
const licenseValidFrom = ref(new Date('2024-01-01'))
const licenseValidUntil = ref(new Date('2025-01-01'))
const licenseUsers = ref('Unlimited')

// Computed
const licenseStatusText = computed(() => {
  const statusMap = {
    'success': t('license.active'),
    'error': t('license.expired'),
    'warning': t('license.expiringSoon'),
    'processing': t('license.checking')
  }
  return statusMap[licenseStatus.value]
})

// Methods
const formatDate = (date: Date) => {
  return dayjs(date).format('DD.MM.YYYY')
}

const showActivationModal = () => {
  activationModalVisible.value = true
  licenseKey.value = ''
}

const checkLicense = async () => {
  checkingLicense.value = true
  try {
    // Тут буде виклик API для перевірки ліцензії
    await new Promise(resolve => setTimeout(resolve, 1500))
    message.success(t('license.checkSuccess'))
  } catch (error) {
    message.error(t('license.checkError'))
  } finally {
    checkingLicense.value = false
  }
}

const activateLicense = async () => {
  if (!licenseKey.value) {
    message.error(t('license.keyRequired'))
    return
  }
  
  activatingLicense.value = true
  try {
    // Тут буде виклик API для активації ліцензії
    await new Promise(resolve => setTimeout(resolve, 1500))
    message.success(t('license.activationSuccess'))
    activationModalVisible.value = false
  } catch (error) {
    message.error(t('license.activationError'))
  } finally {
    activatingLicense.value = false
  }
}
</script>