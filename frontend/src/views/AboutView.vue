<!-- frontend/src/views/AboutView.vue -->

<template>
  <div>
    <a-page-header
      :title="$t('about.title')"
    />
    
    <a-card style="margin-top: 24px">
      <a-descriptions :title="$t('app.name')" bordered>
        <a-descriptions-item :label="$t('about.version')">
          1.0.0
        </a-descriptions-item>
        <a-descriptions-item :label="$t('about.developer')">
          Your Company
        </a-descriptions-item>
        <a-descriptions-item :label="$t('about.license')">
          MIT
        </a-descriptions-item>
        <a-descriptions-item label="Vue">
          3.5.x
        </a-descriptions-item>
        <a-descriptions-item label="Ant Design Vue">
          4.x
        </a-descriptions-item>
        <a-descriptions-item label="Vite">
          5.x
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
    
    <a-card style="margin-top: 24px" title="Features">
      <a-timeline>
        <a-timeline-item color="green">
          <CheckCircleOutlined /> Bitrix24 Integration
        </a-timeline-item>
        <a-timeline-item color="green">
          <CheckCircleOutlined /> Multi-language Support
        </a-timeline-item>
        <a-timeline-item color="green">
          <CheckCircleOutlined /> Dark/Light Theme
        </a-timeline-item>
        <a-timeline-item color="blue">
          <SyncOutlined spin /> Auto-resize Frame
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons-vue'
</script>