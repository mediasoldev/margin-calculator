<!-- frontend/src/components/pages/HomePageComponent.vue -->

<template>
  <div>
    <a-page-header
      :title="$t('home.title')"
      :sub-title="$t('home.description')"
    />
    
    <a-row :gutter="16" style="margin-top: 24px">
      <a-col :xs="24" :sm="12">
        <a-card>
          <a-statistic
            :title="$t('home.user')"
            :value="appStore.userName"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12">
        <a-card>
          <a-statistic
            :title="$t('home.domain')"
            :value="appStore.domain || 'localhost'"
          />
        </a-card>
      </a-col>
    </a-row>
    
    <a-card style="margin-top: 24px">
      <template #title>
        <CheckCircleOutlined style="color: #52c41a" />
        {{ $t('home.status') }}
      </template>
      
      <a-descriptions>
        <a-descriptions-item label="BX24">
          <a-tag :color="bx24.isReady ? 'green' : 'red'">
            {{ bx24.isReady ? $t('home.active') : 'Inactive' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Admin">
          <a-tag :color="bx24.isAdmin ? 'blue' : 'default'">
            {{ bx24.isAdmin ? $t('common.yes') : $t('common.no') }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Language">
          <a-tag>{{ bx24.currentLang }}</a-tag>
        </a-descriptions-item>
      </a-descriptions>
      
      <a-button type="primary" @click="testApiCall" :loading="loading" style="margin-top: 16px">
        Test API Call
      </a-button>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useBX24 } from '@/composables/useBX24'
import { CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const appStore = useAppStore()
const bx24 = useBX24()
const loading = ref(false)

const testApiCall = async () => {
  loading.value = true
  try {
    const result = await bx24.callMethod('profile')
    appStore.setUser(result)
    message.success('User data loaded!')
  } catch (error) {
    message.error('API call failed')
  } finally {
    loading.value = false
  }
}
</script>