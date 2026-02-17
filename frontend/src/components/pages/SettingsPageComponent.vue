<!-- frontend/src/components/pages/SettingsPageComponent.vue -->

<template>
  <div class="settings-page">
    <a-card>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="bitrix" :tab="$t('settings.bitrixIntegration')">
          <BitrixIntegration />
        </a-tab-pane>
        
        <a-tab-pane key="theme" :tab="$t('settings.appTheme')">
          <ThemeSettings />
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BitrixIntegration from '../settings/BitrixIntegration.vue'
import ThemeSettings from '../settings/ThemeSettings.vue'

const activeTab = ref('bitrix')
</script>

<style scoped>
.settings-page {
  padding: 20px;
}
</style>