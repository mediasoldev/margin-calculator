// frontend/src/composables/useTheme.ts

import { ref, computed, watch, readonly } from 'vue'
import { theme } from 'ant-design-vue'
import { useLocalStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark' | 'auto'

// Persistent storage
const themeMode = useLocalStorage<ThemeMode>('theme-mode', 'light')
const primaryColor = useLocalStorage('primary-color', '#1677ff')
const textColor = useLocalStorage('text-color', '#000000')
const compactMode = useLocalStorage('compact-mode', false)
const enableAnimations = useLocalStorage('enable-animations', true)

export function useTheme() {
  // Computed states
  const isDark = computed(() => {
    if (themeMode.value === 'auto') {
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return false
    }
    return themeMode.value === 'dark'
  })
  
  const algorithm = computed(() => {
    return isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm
  })
  
  // Helper function to get color brightness
  const getColorBrightness = (color: string): number => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    // Calculate relative luminance
    return (r * 299 + g * 587 + b * 114) / 1000
  }
  
  // Helper function to get contrasting text color
  const getContrastTextColor = (bgColor: string): string => {
    const brightness = getColorBrightness(bgColor)
    // If background is light (brightness > 128), use dark text, otherwise use light text
    return brightness > 128 ? '#000000' : '#ffffff'
  }
  
  // Helper function to adjust color brightness
  const adjustColor = (color: string, percent: number): string => {
    // Convert hex to RGB
    const num = parseInt(color.replace('#', ''), 16)
    const r = (num >> 16) + percent
    const g = ((num >> 8) & 0x00ff) + percent
    const b = (num & 0x0000ff) + percent
    
    // Ensure values are within 0-255
    const clamp = (val: number) => Math.min(255, Math.max(0, val))
    
    // Convert back to hex
    const newColor = '#' + 
      ((clamp(r) << 16) | (clamp(g) << 8) | clamp(b))
        .toString(16)
        .padStart(6, '0')
    
    return newColor
  }
  
  // Helper function to adjust color opacity
  const adjustColorOpacity = (color: string, opacity: number): string => {
    // Handle both hex and rgb formats
    if (color.startsWith('rgb')) {
      // Already in rgb format, just adjust opacity
      const matches = color.match(/\d+/g)
      if (matches && matches.length >= 3) {
        return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${opacity})`
      }
    }
    
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) || 0
    const g = parseInt(hex.substr(2, 2), 16) || 0
    const b = parseInt(hex.substr(4, 2), 16) || 0
    
    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  // Computed colors for primary button text
  const primaryButtonTextColor = computed(() => {
    return isDark.value ? '#ffffff' : getContrastTextColor(primaryColor.value)
  })
  
  const themeConfig = computed(() => ({
    algorithm: algorithm.value,
    token: {
      // Primary color settings
      colorPrimary: primaryColor.value,
      colorPrimaryHover: adjustColor(primaryColor.value, 20),
      colorPrimaryActive: adjustColor(primaryColor.value, -20),
      colorPrimaryBg: adjustColorOpacity(primaryColor.value, 0.1),
      colorPrimaryBgHover: adjustColorOpacity(primaryColor.value, 0.2),
      colorPrimaryBorder: adjustColorOpacity(primaryColor.value, 0.3),
      colorPrimaryBorderHover: adjustColorOpacity(primaryColor.value, 0.4),
      colorPrimaryText: primaryColor.value,
      colorPrimaryTextHover: adjustColor(primaryColor.value, 20),
      colorPrimaryTextActive: adjustColor(primaryColor.value, -20),
      
      // Text color settings
      colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
      colorTextBase: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
      colorTextSecondary: isDark.value ? 'rgba(255, 255, 255, 0.65)' : adjustColorOpacity(textColor.value, 0.65),
      colorTextTertiary: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
      colorTextQuaternary: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.25),
      colorTextLabel: isDark.value ? 'rgba(255, 255, 255, 0.65)' : adjustColorOpacity(textColor.value, 0.65),
      colorTextDescription: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
      colorTextPlaceholder: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.25),
      colorTextDisabled: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.25),
      colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
      
      // Link colors
      colorLink: primaryColor.value,
      colorLinkHover: adjustColor(primaryColor.value, 20),
      colorLinkActive: adjustColor(primaryColor.value, -20),
      
      // Border and background
      borderRadius: 6,
      
      // Typography
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      fontSize: 14,
      
      // Control heights
      controlHeight: compactMode.value ? 28 : 32,
      controlHeightLG: compactMode.value ? 36 : 40,
      controlHeightSM: compactMode.value ? 20 : 24,
      
      // Spacing
      padding: compactMode.value ? 12 : 16,
      paddingLG: compactMode.value ? 20 : 24,
      paddingSM: compactMode.value ? 8 : 12,
      paddingXS: compactMode.value ? 4 : 8,
      
      // Margins
      margin: compactMode.value ? 12 : 16,
      marginLG: compactMode.value ? 20 : 24,
      marginSM: compactMode.value ? 8 : 12,
      marginXS: compactMode.value ? 4 : 8
    },
    components: {
      Button: {
        colorPrimary: primaryColor.value,
        algorithm: true,
        primaryColor: primaryColor.value,
        colorTextLightSolid: primaryButtonTextColor.value,
        colorPrimaryText: primaryButtonTextColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        defaultBorderColor: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.25),
        defaultColor: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Input: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextPlaceholder: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.35),
        addonBg: isDark.value ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
      },
      Select: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextPlaceholder: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.35),
        optionSelectedBg: adjustColorOpacity(primaryColor.value, 0.1),
        optionSelectedColor: primaryColor.value
      },
      DatePicker: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextPlaceholder: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.35)
      },
      Radio: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        buttonSolidCheckedColor: primaryButtonTextColor.value,
        buttonCheckedBg: primaryColor.value,
        dotSize: 8,
        radioSize: 16
      },
      Checkbox: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorWhite: '#ffffff',
        borderRadius: 4
      },
      Switch: {
        colorPrimary: primaryColor.value,
        colorTextQuaternary: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.25)
      },
      Slider: {
        colorPrimary: primaryColor.value,
        handleColor: primaryColor.value,
        handleActiveColor: adjustColor(primaryColor.value, 20),
        dotBorderColor: adjustColorOpacity(primaryColor.value, 0.5),
        railBg: isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        railHoverBg: isDark.value ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        trackBg: primaryColor.value,
        trackHoverBg: adjustColor(primaryColor.value, 20)
      },
      Typography: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextDescription: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
        colorLink: primaryColor.value
      },
      Card: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextDescription: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
        colorBorderSecondary: isDark.value ? 'rgba(255, 255, 255, 0.15)' : 'rgba(5, 5, 5, 0.06)'
      },
      Table: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        headerBg: isDark.value ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        rowHoverBg: isDark.value ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)'
      },
      Tag: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextLabel: isDark.value ? 'rgba(255, 255, 255, 0.65)' : textColor.value,
        defaultBg: isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
      },
      Badge: {
        colorPrimary: primaryColor.value
      },
      Progress: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        remainingColor: isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        defaultColor: primaryColor.value
      },
      Rate: {
        colorText: adjustColorOpacity(textColor.value, 0.25),
        colorFillContent: primaryColor.value,
        colorBgContainer: adjustColorOpacity(textColor.value, 0.1)
      },
      Form: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        labelColor: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        labelColonMarginInlineEnd: 8,
        labelColonMarginInlineStart: 2
      },
      Menu: {
        colorItemText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorItemTextHover: isDark.value ? 'rgba(255, 255, 255, 1)' : textColor.value,
        colorItemTextSelected: primaryColor.value,
        colorItemBgSelected: adjustColorOpacity(primaryColor.value, 0.1),
        colorItemBgHover: isDark.value ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.02)',
        colorActiveBarWidth: 3,
        itemMarginInline: 4
      },
      Dropdown: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextDescription: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45)
      },
      Divider: {
        colorSplit: isDark.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(5, 5, 5, 0.06)'
      },
      Modal: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Drawer: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Alert: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Tabs: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        itemHoverColor: primaryColor.value,
        itemSelectedColor: primaryColor.value,
        inkBarColor: primaryColor.value
      },
      Timeline: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorSplit: isDark.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(5, 5, 5, 0.06)'
      },
      Tooltip: {
        colorText: '#ffffff',
        colorBgDefault: 'rgba(0, 0, 0, 0.85)'
      },
      Popover: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Notification: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextHeading: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorIcon: primaryColor.value
      },
      Message: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Pagination: {
        colorPrimary: primaryColor.value,
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextDisabled: isDark.value ? 'rgba(255, 255, 255, 0.25)' : adjustColorOpacity(textColor.value, 0.25)
      },
      Avatar: {
        colorTextLightSolid: '#ffffff'
      },
      Breadcrumb: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
        colorTextDescription: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
        linkColor: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45),
        linkHoverColor: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        lastItemColor: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        separatorColor: isDark.value ? 'rgba(255, 255, 255, 0.45)' : adjustColorOpacity(textColor.value, 0.45)
      },
      Statistic: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value
      },
      Descriptions: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextSecondary: isDark.value ? 'rgba(255, 255, 255, 0.65)' : adjustColorOpacity(textColor.value, 0.65),
        colorSplit: isDark.value ? 'rgba(255, 255, 255, 0.12)' : 'rgba(5, 5, 5, 0.06)'
      },
      PageHeader: {
        colorText: isDark.value ? 'rgba(255, 255, 255, 0.85)' : textColor.value,
        colorTextDescription: isDark.value ? 'rgba(255, 255, 255, 0.65)' : adjustColorOpacity(textColor.value, 0.65)
      }
    }
  }))
  
  // Methods
  const toggleTheme = () => {
    themeMode.value = isDark.value ? 'light' : 'dark'
    applyTheme()
  }
  
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
    applyTheme()
  }
  
  const setPrimaryColor = (color: string) => {
    primaryColor.value = color
    applyCSSVariables()
  }
  
  const setTextColor = (color: string) => {
    textColor.value = color
    applyCSSVariables()
  }
  
  const setCompactMode = (enabled: boolean) => {
    compactMode.value = enabled
    applyBodyClasses()
  }
  
  const setAnimationsEnabled = (enabled: boolean) => {
    enableAnimations.value = enabled
    applyBodyClasses()
  }
  
  // Apply theme to DOM
  const applyTheme = () => {
    const actuallyDark = isDark.value
    
    if (actuallyDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      document.body.style.backgroundColor = '#141414'
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f0f2f5'
    }
    
    applyCSSVariables()
  }
  
  // Apply CSS variables for colors
  const applyCSSVariables = () => {
    if (typeof window !== 'undefined' && document.documentElement) {
      const root = document.documentElement
      
      // Primary color and its variations
      root.style.setProperty('--primary-color', primaryColor.value)
      root.style.setProperty('--primary-color-hover', adjustColor(primaryColor.value, 20))
      root.style.setProperty('--primary-color-active', adjustColor(primaryColor.value, -20))
      root.style.setProperty('--primary-color-bg', adjustColorOpacity(primaryColor.value, 0.1))
      
      // Text color and its variations
      root.style.setProperty('--text-color', textColor.value)
      root.style.setProperty('--text-color-secondary', adjustColorOpacity(textColor.value, 0.65))
      root.style.setProperty('--text-color-tertiary', adjustColorOpacity(textColor.value, 0.45))
      root.style.setProperty('--text-color-disabled', adjustColorOpacity(textColor.value, 0.25))
      
      // Button text contrast color
      root.style.setProperty('--primary-button-text', primaryButtonTextColor.value)
      
      // Apply text color to body for global effect (only in light mode)
      if (!isDark.value) {
        document.body.style.color = textColor.value
      } else {
        document.body.style.color = 'rgba(255, 255, 255, 0.85)'
      }
    }
  }
  
  // Apply body classes for various modes
  const applyBodyClasses = () => {
    if (typeof window !== 'undefined' && document.documentElement) {
      // Compact mode
      if (compactMode.value) {
        document.documentElement.classList.add('compact-mode')
      } else {
        document.documentElement.classList.remove('compact-mode')
      }
      
      // Animations
      if (!enableAnimations.value) {
        document.documentElement.classList.add('no-animations')
      } else {
        document.documentElement.classList.remove('no-animations')
      }
    }
  }
  
  // Initialize on mount
  if (typeof window !== 'undefined') {
    // Apply initial theme
    applyTheme()
    applyBodyClasses()
    
    // Listen for system theme changes when in auto mode
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (themeMode.value === 'auto') {
          applyTheme()
        }
      })
    }
  }
  
  // Watchers
  watch(themeMode, () => {
    applyTheme()
  })
  
  watch(primaryColor, () => {
    applyCSSVariables()
  })
  
  watch(textColor, () => {
    applyCSSVariables()
  })
  
  watch(compactMode, () => {
    applyBodyClasses()
  })
  
  watch(enableAnimations, () => {
    applyBodyClasses()
  })
  
  // Return public interface
  return {
    // States (readonly)
    themeMode: readonly(themeMode),
    isDark: readonly(isDark),
    themeConfig: readonly(themeConfig),
    primaryColor: readonly(primaryColor),
    textColor: readonly(textColor),
    compactMode: readonly(compactMode),
    enableAnimations: readonly(enableAnimations),
    
    // Methods
    toggleTheme,
    setTheme,
    setPrimaryColor,
    setTextColor,
    setCompactMode,
    setAnimationsEnabled
  }
}