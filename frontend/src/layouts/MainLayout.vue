<!-- frontend/src/layouts/MainLayout.vue -->

<template>
  <a-layout class="main-layout">
    <!-- Desktop/Tablet Header -->
    <a-layout-header v-show="!isMobile" class="desktop-header" :class="{ 'light-header': !isDarkMode }">
      <div class="header-content">
        <!-- Logo and Menu -->
        <div class="header-left">
          <div class="logo">
            <span class="logo-icon">B24</span>
            <span class="logo-text">{{ $t('app.name') }}</span>
          </div>
          
          <a-menu
            v-model:selectedKeys="selectedKeys"
            :theme="isDarkMode ? 'dark' : 'light'"
            mode="horizontal"
            class="desktop-menu"
          >
            <a-menu-item key="home" @click="navigateTo('/')">
              <template #icon><HomeOutlined /></template>
              {{ $t('menu.home') }}
            </a-menu-item>
            
            <a-menu-item key="settings" @click="navigateTo('/settings')">
              <template #icon><SettingOutlined /></template>
              {{ $t('menu.settings') }}
            </a-menu-item>
            
            <a-menu-item key="license" @click="navigateTo('/license')">
              <template #icon><FileProtectOutlined /></template>
              {{ $t('menu.license') }}
            </a-menu-item>
            
            <a-menu-item key="about" @click="navigateTo('/about')">
              <template #icon><InfoCircleOutlined /></template>
              {{ $t('menu.about') }}
            </a-menu-item>
          </a-menu>
        </div>
        
        <!-- Controls -->
        <div class="header-right">
          <a-dropdown placement="bottomRight" :trigger="['click']">
            <a-button type="text" class="lang-button" :class="{ 'light-lang-button': !isDarkMode }">
              <GlobalOutlined />
              <span class="lang-text">{{ currentLanguageName }}</span>
            </a-button>
            
            <template #overlay>
              <a-menu @click="handleLanguageChange" class="lang-menu">
                <a-menu-item v-for="lang in languages" :key="lang.code">
                  <span class="flag">{{ lang.flag }}</span>
                  {{ lang.name }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          
          <a-switch
            v-model:checked="isDarkMode"
            @change="handleThemeToggle"
            class="theme-switch"
          >
            <template #checkedChildren>🌙</template>
            <template #unCheckedChildren>☀️</template>
          </a-switch>
        </div>
      </div>
    </a-layout-header>
    
    <!-- Mobile Header -->
    <a-layout-header v-show="isMobile" class="mobile-header" :class="{ 'light-header': !isDarkMode }">
      <div class="mobile-header-content">
        <MenuOutlined @click="drawerVisible = true" class="menu-trigger" />
        <span class="mobile-title">{{ $t('app.name') }}</span>
        <div class="mobile-controls">
          <a-dropdown placement="bottomRight" :trigger="['click']">
            <GlobalOutlined class="mobile-icon" />
            <template #overlay>
              <a-menu @click="handleLanguageChange" class="lang-menu">
                <a-menu-item v-for="lang in languages" :key="lang.code">
                  <span class="flag">{{ lang.flag }}</span>
                  {{ lang.name }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-layout-header>
    
    <!-- Mobile Drawer Menu -->
    <a-drawer
      v-model:open="drawerVisible"
      placement="left"
      :width="280"
      :closable="false"
      class="mobile-drawer"
    >
      <div class="drawer-header">
        <div class="drawer-logo">
          <span class="logo-icon">B24</span>
        </div>
        <div class="drawer-user">
          <a-avatar size="large" style="background-color: #1890ff">
            {{ userInitial }}
          </a-avatar>
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-domain">{{ userDomain }}</div>
          </div>
        </div>
      </div>
      
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        class="drawer-menu"
        @click="handleMobileMenuClick"
      >
        <a-menu-item key="home">
          <template #icon><HomeOutlined /></template>
          {{ $t('menu.home') }}
        </a-menu-item>
        
        <a-menu-item key="settings">
          <template #icon><SettingOutlined /></template>
          {{ $t('menu.settings') }}
        </a-menu-item>
        
        <a-menu-item key="license">
          <template #icon><FileProtectOutlined /></template>
          {{ $t('menu.license') }}
        </a-menu-item>
        
        <a-menu-item key="about">
          <template #icon><InfoCircleOutlined /></template>
          {{ $t('menu.about') }}
        </a-menu-item>
      </a-menu>
      
      <div class="drawer-footer">
        <div class="theme-selector">
          <span class="theme-label">{{ $t('settings.theme') }}</span>
          <a-switch
            v-model:checked="isDarkMode"
            @change="handleThemeToggle"
          >
            <template #checkedChildren>🌙</template>
            <template #unCheckedChildren>☀️</template>
          </a-switch>
        </div>
      </div>
    </a-drawer>
    
    <!-- Content -->
    <a-layout-content class="main-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useAppStore } from '@/stores/app'
import { setLanguage, type AvailableLocales } from '@/locales'
import { 
  HomeOutlined, 
  SettingOutlined, 
  InfoCircleOutlined, 
  GlobalOutlined,
  MenuOutlined,
  FileProtectOutlined
} from '@ant-design/icons-vue'

// Composables
const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const { isDark, toggleTheme } = useTheme()
const appStore = useAppStore()

// State
const selectedKeys = ref<string[]>([])
const isMobile = ref(window.innerWidth < 768)
const drawerVisible = ref(false)
const isDarkMode = ref(isDark.value)

// Languages data
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ua', name: 'Українська', flag: '🇺🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'br', name: 'Português', flag: '🇧🇷' },
  { code: 'la', name: 'Español', flag: '🇪🇸' }
]

// Computed
const currentLanguageName = computed(() => {
  const shortNames: Record<AvailableLocales, string> = {
    'en': 'EN', 'ua': 'UA', 'ru': 'RU', 'de': 'DE',
    'fr': 'FR', 'it': 'IT', 'pl': 'PL', 'br': 'BR', 'la': 'LA'
  }
  return shortNames[locale.value as AvailableLocales] || 'EN'
})

const userName = computed(() => appStore.userName || 'Guest')
const userDomain = computed(() => appStore.domain || 'localhost')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

// Methods
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    drawerVisible.value = false
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const handleLanguageChange = ({ key }: { key: string }) => {
  setLanguage(key)
  if (isMobile.value) {
    setTimeout(() => {
      drawerVisible.value = false
    }, 300)
  }
}

const handleThemeToggle = () => {
  toggleTheme()
}

const handleMobileMenuClick = () => {
  setTimeout(() => {
    drawerVisible.value = false
  }, 200)
}

// Lifecycle
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  const routeName = route.name?.toString() || 'home'
  selectedKeys.value = [routeName]
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

// Watchers
watch(() => route.name, (newName) => {
  if (newName) {
    selectedKeys.value = [newName.toString()]
  }
})

watch(isDark, (newValue) => {
  isDarkMode.value = newValue
})
</script>

<style scoped>
/* Layout */
.main-layout {
  min-height: 100vh;
  background: transparent;
}

/* Desktop Header - Dark Theme (default) */
.desktop-header {
  padding: 0;
  background: #001529;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

/* Desktop Header - Light Theme */
.desktop-header.light-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.logo {
  display: flex;
  align-items: center;
  margin-right: 40px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  margin-right: 12px;
}

.logo-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
  white-space: nowrap;
}

.light-header .logo-text {
  color: rgba(0, 0, 0, 0.85);
}

.desktop-menu {
  background: transparent;
  border: none;
  line-height: 64px;
  min-width: 500px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.lang-button {
  color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  gap: 6px;
}

.lang-button:hover {
  color: white;
}

.light-lang-button {
  color: rgba(0, 0, 0, 0.65) !important;
}

.light-lang-button:hover {
  color: rgba(0, 0, 0, 0.85) !important;
}

.lang-menu {
  min-width: 150px;
}

.flag {
  display: inline-block;
  width: 24px;
  margin-right: 8px;
}

.theme-switch {
  background-color: rgba(255, 255, 255, 0.2);
}

.light-header .theme-switch {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Mobile Header */
.mobile-header {
  padding: 0;
  background: #001529;
  height: 56px;
  line-height: 56px;
}

.mobile-header.light-header {
  background: #fff;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.menu-trigger {
  color: white;
  font-size: 20px;
}

.light-header .menu-trigger {
  color: rgba(0, 0, 0, 0.85);
}

.mobile-title {
  color: white;
  font-size: 16px;
  font-weight: 500;
  flex: 1;
  text-align: center;
  margin: 0 16px;
}

.light-header .mobile-title {
  color: rgba(0, 0, 0, 0.85);
}

.mobile-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-icon {
  color: rgba(255, 255, 255, 0.85);
  font-size: 18px;
}

.light-header .mobile-icon {
  color: rgba(0, 0, 0, 0.65);
}

/* Mobile Drawer */
.mobile-drawer :deep(.ant-drawer-body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.drawer-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.drawer-logo .logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 20px;
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.user-domain {
  font-size: 12px;
  opacity: 0.8;
}

.drawer-menu {
  flex: 1;
  border: none;
}

.drawer-footer {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.theme-selector {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-label {
  font-size: 14px;
  color: #666;
}

/* Content */
.main-content {
  padding: 1px;
}

.content-wrapper {
  padding: 24px;
  border-radius: 8px;
  min-height: calc(100vh - 112px);
  background: var(--content-bg, white);
}

/* Dark mode support */
:global(html.dark) {
  --content-bg: #1f1f1f;
}

:global(html.light) {
  --content-bg: white;
}

:global(html.dark) .drawer-footer {
  border-top-color: #303030;
}

:global(html.dark) .theme-label {
  color: rgba(255, 255, 255, 0.65);
}

/* Menu hover effects for light theme */
:deep(.ant-menu-light.ant-menu-horizontal > .ant-menu-item:hover) {
  color: #1890ff;
}

:deep(.ant-menu-light.ant-menu-horizontal > .ant-menu-item-selected) {
  color: #1890ff;
  border-bottom-color: #1890ff;
}

/* Menu hover effects for dark theme */
:deep(.ant-menu-dark.ant-menu-horizontal > .ant-menu-item:hover),
:deep(.ant-menu-dark.ant-menu-horizontal > .ant-menu-item-selected) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* Responsive adjustments */
@media (max-width: 768px) { 
  .content-wrapper {
    padding: 16px;
    min-height: calc(100vh - 88px);
    border-radius: 0;
  }
}

@media (max-width: 992px) and (min-width: 768px) {
  .logo-text {
    display: none;
  }
  
  .desktop-menu {
    min-width: auto;
  }
  
  .lang-text {
    display: none;
  }
}

/* Animations */
.menu-trigger {
  transition: transform 0.3s;
}

.menu-trigger:active {
  transform: scale(0.9);
}
</style>