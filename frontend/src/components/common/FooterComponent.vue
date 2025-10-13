<!-- frontend/src/components/common/FooterComponent.vue -->

<template>
  <div
    v-if="!isLoading"
    id="footer"
    :style="{ 
      width: '100%', 
      height: 'fit-content', 
      backgroundColor: iframeBackground 
    }"
  >
    <iframe
      :src="iframeUrl"
      :style="{
        width: iframeWidth,
        height: iframeHeight,
        maxWidth: '99%',
        border: 'none',
        backgroundColor: iframeBackground
      }"
      @load="handleIframeLoad"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useBX24 } from '@/composables/useBX24'

// Composables
const { locale } = useI18n()
const { primaryColor, isDark } = useTheme()
const bx24 = useBX24()

// State
const iframeWidth = ref('0')
const iframeHeight = ref('0')
const isLoading = ref(true)

// Constants
const FOOTER_BASE_URL = 'https://local.app.support.pl/app-resource-library/footer/'
const FOOTER_API_URL = 'https://local.app.support.pl/app-resource-library/footer/ajax/index.php'

// Helper function to determine if color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate brightness using standard formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  
  // If brightness > 128, it's a light color
  return brightness > 128
}

// Computed
const iframeBackground = computed(() => {
  return primaryColor.value
})

const iframeColor = computed(() => {
  // Determine text color based on background brightness
  return isLightColor(primaryColor.value) ? '#000000' : '#ffffff'
})

const iframeUrl = computed(() => {
  const background = encodeURIComponent(iframeBackground.value)
  const color = encodeURIComponent(iframeColor.value)
  const lang = locale.value
  
  return `${FOOTER_BASE_URL}?background=${background}&color=${color}&lang=${lang}`
})

// Methods
const fetchFooterSize = async (): Promise<void> => {
  try {
    const response = await fetch(FOOTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '.iframeSize'
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result && result.data) {
      if (result.data.iframeWidth) {
        iframeWidth.value = result.data.iframeWidth
      }

      if (result.data.iframeHeight) {
        // Затримка для коректного відображення
        setTimeout(() => {
          iframeHeight.value = result.data.iframeHeight
          isLoading.value = false
        }, 500)
      } else {
        isLoading.value = false
      }
    } else {
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching footer size:', error)
    isLoading.value = false
  }
}

const handleIframeLoad = (): void => {
  // Підганяємо вікно BX24 після завантаження iframe
  if (window.BX24?.fitWindow) {
    setTimeout(() => {
      window.BX24.fitWindow()
    }, 300)
  }
}

// Lifecycle
onMounted(async () => {
  await fetchFooterSize()
  
  // Фінальне підганяння вікна
  if (window.BX24?.fitWindow) {
    setTimeout(() => {
      window.BX24.fitWindow()
    }, 1000)
  }
})
</script>

<style scoped>
#footer {
  margin-top: auto;
}
</style>