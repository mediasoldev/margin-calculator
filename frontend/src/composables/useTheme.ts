// frontend/src/composables/useTheme.ts

import { ref, computed, watch, readonly } from 'vue'
import { theme } from 'ant-design-vue'
import { useLocalStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

const themeMode = useLocalStorage<ThemeMode>('theme-mode', 'light')
const primaryColor = useLocalStorage('primary-color', '#1677ff')

export function useTheme() {
  const isDark = computed(() => themeMode.value === 'dark')
  
  const algorithm = computed(() => {
    return isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm
  })
  
  const themeConfig = computed(() => ({
    algorithm: algorithm.value,
    token: {
      colorPrimary: primaryColor.value,
      borderRadius: 6,
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
    }
  }))
  
  const toggleTheme = () => {
    themeMode.value = isDark.value ? 'light' : 'dark'
    updateBodyTheme(themeMode.value)
  }
  
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    updateBodyTheme(mode)
  }
  
  const setPrimaryColor = (color: string) => {
    primaryColor.value = color
  }
  
  const updateBodyTheme = (mode: ThemeMode) => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.body.style.backgroundColor = '#141414'
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f0f2f5'
    }
  }
  
  // Ініціалізація теми при завантаженні
  if (typeof window !== 'undefined') {
    updateBodyTheme(themeMode.value)
  }
  
  // Слідкуємо за змінами теми
  watch(themeMode, (newMode) => {
    updateBodyTheme(newMode)
  })
  
  return {
    themeMode: readonly(themeMode),
    isDark: readonly(isDark),
    themeConfig: readonly(themeConfig),
    toggleTheme,
    setTheme,
    setPrimaryColor
  }
}