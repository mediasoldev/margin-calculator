<!-- frontend/src/components/pages/LicensePageComponent.vue -->

<template>
  <div style="padding-top: 30px; max-width: 600px; margin: auto">
    <a-spin :spinning="isLoading">
      <!-- License Status Alert -->
      <a-alert
        v-if="license && shouldShowWarning"
        :message="licenseMessage"
        :type="alertType"
        :show-icon="true"
        style="margin-bottom: 24px"
        banner
      />

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
            {{ formattedExpirationDate || 'N/A' }}
          </div>
        </a-form-item>

        <a-form-item :label="$t('license.expiresIn')">
          <h3 v-if="daysLeft.days > 0" :style="{ color: daysLeft.isExpiringSoon ? '#faad14' : '#52c41a', margin: 0 }">
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
            {{ license?.licensedTo || appData?.domain || 'N/A' }}
          </div>
        </a-form-item>

        <a-form-item :label="$t('license.maxUsers')">
          <div style="padding: 4px 11px; background: #fafafa; border: 1px solid #d9d9d9; border-radius: 6px">
            {{ license?.maxUsers || $t('license.unlimited') }}
          </div>
        </a-form-item>

        <!-- License Status Badge -->
        <a-form-item label="Status">
          <a-tag :color="licenseBadgeColor" style="font-size: 14px; padding: 4px 12px">
            {{ licenseStatusText }}
          </a-tag>
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
import { computed, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLicense } from '@/composables/useLicense'
import { LICENSE_CONFIG } from '@/config/license.config'
import { message } from 'ant-design-vue'

const { t } = useI18n()

const appData = inject('appData', window.APP_DATA)

const { 
  license, 
  isLoading, 
  daysLeft,
  licenseMessage,
  licenseStatusText,
  licenseBadgeStatus,
  shouldShowWarning,
  formattedExpirationDate,
  fetchLicense
} = useLicense()

// Company info from config
const companyInfo = LICENSE_CONFIG.company

// Computed
const displayLicenseKey = computed(() => {
  if (!license.value?.licenseKey) return ''
  
  // Mask license key: XXXX-XXXX-XXXX-XXXX -> XXXX-****-****-XXXX
  const key = license.value.licenseKey
  const parts = key.split('-')
  
  if (parts.length === 4) {
    return `${parts[0]}-****-****-${parts[3]}`
  }
  
  return key
})

const alertType = computed(() => {
  if (!license.value) return 'warning'
  
  if (daysLeft.value.isExpired) return 'error'
  if (daysLeft.value.isExpiringSoon) return 'warning'
  if (license.value.isTrial) return 'info'
  
  return 'success'
})

const licenseBadgeColor = computed(() => {
  const colorMap = {
    success: 'green',
    error: 'red',
    warning: 'orange',
    processing: 'blue',
    default: 'default'
  }
  return colorMap[licenseBadgeStatus.value] || 'default'
})

// Methods
const checkLicense = async () => {
  try {
    const result = await fetchLicense()
    
    if (!result.success && result.error) {
      console.error('[LicensePage] License check failed:', result.error)
      message.error(t('license.checkError'))
    } else {
      console.log('[LicensePage] License loaded:', {
        status: licenseStatusText.value,
        daysLeft: daysLeft.value.days,
        isTrial: license.value?.isTrial
      })
    }
  } catch (error) {
    console.error('[LicensePage] Error checking license:', error)
    message.error(t('license.checkError'))
  }
}

// Lifecycle
onMounted(async () => {
  console.log('[LicensePage] Component mounted, loading license...')
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

:deep(.ant-alert) {
  border-radius: 8px;
}
</style>