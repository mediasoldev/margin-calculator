<!-- frontend/src/App.vue -->

<template>
  <a-config-provider
    :theme="themeConfig"
    :locale="antLocale"
  >
    <a-app>
      <component :is="layoutComponent">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </component>
    </a-app>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useBX24 } from '@/composables/useBX24'
import { useAppStore } from '@/stores/app'
import MainLayout from '@/layouts/MainLayout.vue'
import WidgetLayout from '@/layouts/WidgetLayout.vue'

// Ant Design locales
import enUS from 'ant-design-vue/es/locale/en_US'
import ukUA from 'ant-design-vue/es/locale/uk_UA'
import ruRU from 'ant-design-vue/es/locale/ru_RU'
import deDE from 'ant-design-vue/es/locale/de_DE'
import frFR from 'ant-design-vue/es/locale/fr_FR'
import itIT from 'ant-design-vue/es/locale/it_IT'
import plPL from 'ant-design-vue/es/locale/pl_PL'
import ptBR from 'ant-design-vue/es/locale/pt_BR'
import esES from 'ant-design-vue/es/locale/es_ES'

const route = useRoute()
const { locale } = useI18n()
const { themeConfig, isDark } = useTheme()
const bx24 = useBX24()
const appStore = useAppStore()

// Визначаємо який layout використовувати
const layoutComponent = computed(() => {
  // Перевіряємо meta.layout в роуті
  const layoutType = route.meta?.layout as string || 'main'
  
  // Якщо layout = 'widget' або 'embedded', використовуємо WidgetLayout
  if (layoutType === 'widget' || layoutType === 'embedded') {
    return WidgetLayout
  }
  
  // За замовчуванням використовуємо MainLayout
  return MainLayout
})

// Мапінг локалей для Ant Design
const antLocale = computed(() => {
  const locales: Record<string, any> = {
    'en': enUS,
    'ua': ukUA,
    'ru': ruRU,
    'de': deDE,
    'fr': frFR,
    'it': itIT,
    'pl': plPL,
    'br': ptBR,
    'la': esES
  }
  return locales[locale.value] || enUS
})

// Initialize app
onMounted(async () => {
  // Wait for BX24 to be ready
  await bx24.init()
  
  // Set auth data if available
  if (bx24.auth.value) {
    appStore.setAuth(bx24.auth.value)
  }
  
  // Load current user
  if (bx24.isReady.value) {
    try {
      const user = await bx24.callMethod('profile')
      appStore.setUser(user)
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }
  
  // Auto-fit window після завантаження
  if (window.BX24?.fitWindow) {
    setTimeout(() => {
      window.BX24.fitWindow()
    }, 100)
  }
})

// Слідкуємо за зміною роуту для auto-resize
watch(() => route.path, () => {
  if (window.BX24?.fitWindow) {
    setTimeout(() => {
      window.BX24.fitWindow()
    }, 100)
  }
})
</script>

<style>
/* Reset styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Root styles */
html, body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  transition: background-color 0.3s ease;
}

/* Light theme */
html.light body {
  background-color: #f0f2f5;
}

/* Dark theme */
html.dark body {
  background-color: #141414;
}

/* App container */
#app {
  min-height: 100vh;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Ant Design App component */
.ant-app {
  min-height: 100vh;
}

/* Layout fixes */
.ant-layout {
  min-height: 100vh;
  background: transparent;
}

.ant-layout-content {
  background: transparent;
}

/* Dark theme specific overrides */
html.dark .ant-layout-content > div {
  background-color: #1f1f1f !important;
  color: rgba(255, 255, 255, 0.85);
}

html.dark .ant-card {
  background-color: #1f1f1f;
  border-color: #303030;
}

html.dark .ant-page-header {
  background-color: transparent;
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

html.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .ant-layout-content {
    padding: 12px !important;
  }
}
</style>