<!-- frontend/src/components/pages/LicensePageComponent.vue -->

<template>
  <div style="padding-top: 30px; max-width: 600px; margin: auto">
    <a-spin :spinning="isLoading">
      <!-- License Information Form -->
      <a-form :disabled="true">
        <a-form-item :label="$t('license.licenseKey')">
          <a-input
            v-model:value="displayLicenseKey"
            :placeholder="$t('license.noLicense')"
          />
        </a-form-item>

        <a-form-item :label="$t('license.validUntil')">
          <div style="padding: 4px 11px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 6px">
            {{ formatDate(license?.expiresAt) }}
          </div>
        </a-form-item>

        <a-form-item :label="$t('license.expiresIn')">
          <h3 v-if="daysLeft.days > 0" style="margin: 0">
            {{ daysLeft.days }} {{ $t('license.days') }}
          </h3>
          <h3 v-else-if="daysLeft.days === 0" style="color: #faad14; margin: 0">
            {{ $t('license.today') }}
          </h3>
          <h3 v-else style="color: #f5222d; margin: 0">
            {{ $t('license.expired') }}
          </h3>
        </a-form-item>

        <a-form-item :label="$t('license.trial')">
          <h3 :style="license?.isTrial ? { color: '#fa8c16', margin: 0 } : { color: '#52c41a', margin: 0 }">
            {{ license?.isTrial ? $t('common.yes') : $t('common.no') }}
          </h3>
        </a-form-item>

        <a-form-item :label="$t('license.licensedTo')">
          <div style="padding: 4px 11px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 6px">
            {{ license?.licensedTo || appStore.domain || 'localhost' }}
          </div>
        </a-form-item>

        <a-form-item :label="$t('license.maxUsers')">
          <div style="padding: 4px 11px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 6px">
            {{ license?.maxUsers || $t('license.unlimited') }}
          </div>
        </a-form-item>
      </a-form>

      <!-- Divider -->
      <a-divider />

      <!-- Contact Information -->
      <div style="text-align: center">
        <h3>{{ $t('license.purchaseContactTitle') }}</h3>
        <h4>{{ companyInfo.name }}</h4>

        <p>
          {{ $t('license.website') }}:
          <a :href="companyInfo.website" target="_blank">
            {{ companyInfo.website }}
          </a>
        </p>

        <p>
          {{ $t('license.phone') }}:
          <a :href="`tel:${companyInfo.phone}`">{{ companyInfo.phoneDisplay }}</a>
        </p>

        <p>
          {{ $t('license.onlineChat') }}:
          <a :href="companyInfo.chatUrl" target="_blank">
            {{ companyInfo.chatUrl }}
          </a>
        </p>

        <p>
          {{ $t('license.email') }}:
          <a :href="`mailto:${companyInfo.email}`">{{ companyInfo.email }}</a>
        </p>
      </div>

      <br />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { useLicense } from '@/composables/useLicense'
import { LICENSE_CONFIG } from '@/config/license.config'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const { t } = useI18n()
const appStore = useAppStore()
const { 
  license, 
  isLoading, 
  daysLeft,
  fetchLicense: fetchLicenseData
} = useLicense()

// Company info from config
const companyInfo = LICENSE_CONFIG.company

// Computed
const displayLicenseKey = computed(() => {
  return license.value?.licenseKey || ''
})

// Methods
const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A'
  return dayjs(date).format('DD.MM.YYYY')
}

const checkLicense = async () => {
  try {
    const result = await fetchLicenseData()
    if (!result.success && result.error) {
      console.error('License check failed:', result.error)
      message.error(t('license.checkError'))
    }
  } catch (error) {
    console.error('Error checking license:', error)
    message.error(t('license.checkError'))
  }
}

// Lifecycle
onMounted(async () => {
  await checkLicense()
})
</script>

<style scoped>
:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

h3, h4 {
  margin-bottom: 16px;
}

p {
  margin-bottom: 8px;
  font-size: 14px;
}

a {
  color: #1890ff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>