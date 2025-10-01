<!-- frontend/src/layouts/WidgetLayout.vue -->

<template>
  <a-layout class="widget-layout">
    <a-layout-content class="widget-content">
      <div class="widget-wrapper">
        <slot />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBX24 } from '@/composables/useBX24'

const route = useRoute()
const bx24 = useBX24()

// Auto-resize для Bitrix24 iframe
const resizeFrame = () => {
  if (window.BX24?.fitWindow) {
    setTimeout(() => {
      window.BX24.fitWindow()
    }, 100)
  }
}

// Resize при монтуванні
onMounted(() => {
  resizeFrame()
})

// Resize при зміні роуту
watch(() => route.path, () => {
  resizeFrame()
})
</script>

<style scoped>
.widget-layout {
  min-height: 100vh;
  background: transparent;
}

.widget-content {
  padding: 0;
  background: transparent;
}

.widget-wrapper {
  min-height: 100vh;
  background: var(--content-bg, white);
}

/* Dark mode support */
:global(html.dark) .widget-wrapper {
  background-color: #1f1f1f;
  color: rgba(255, 255, 255, 0.85);
}

:global(html.light) .widget-wrapper {
  background-color: white;
}

/* Без відступів для віджетів */
.widget-wrapper > div {
  height: 100%;
}

/* Responsive для мобільних */
@media (max-width: 768px) {
  .widget-wrapper {
    padding: 0;
  }
}
</style>