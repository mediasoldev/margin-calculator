<!-- frontend/src/components/pages/SettingsPageComponent.vue -->

<template>
  <div>
   
    <a-card>
      <a-form
        :model="formState"
        :label-col="{ xs: 24, sm: 6 }"
        :wrapper-col="{ xs: 24, sm: 14 }"
      >
        <!-- Theme Selection -->
        <a-form-item :label="$t('settings.theme')">
          <a-radio-group v-model:value="formState.theme" @change="onThemeChange">
            <a-radio-button value="light">{{ $t('settings.light') }}</a-radio-button>
            <a-radio-button value="dark">{{ $t('settings.dark') }}</a-radio-button>
            <a-radio-button value="auto">{{ $t('settings.auto') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        
        <!-- Primary Color -->
        <a-form-item :label="$t('settings.primaryColor')">
          <a-space wrap>
            <a-input
              v-model:value="formState.primaryColor"
              type="color"
              style="width: 50px; height: 38px; cursor: pointer"
              @change="onColorChange"
            />
            <a-button
              v-for="color in presetColors"
              :key="color"
              :style="{ 
                backgroundColor: color, 
                width: '38px', 
                height: '38px',
                padding: 0,
                border: formState.primaryColor === color ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }"
              @click="setColor(color)"
            />
          </a-space>
        </a-form-item>
        
        <!-- Text Color -->
        <a-form-item :label="$t('settings.textColor')">
          <a-space wrap>
            <a-input
              v-model:value="formState.textColor"
              type="color"
              style="width: 50px; height: 38px; cursor: pointer"
              @change="onTextColorChange"
            />
            <a-button
              v-for="color in textPresetColors"
              :key="color"
              :style="{ 
                backgroundColor: color, 
                width: '38px', 
                height: '38px',
                padding: 0,
                border: formState.textColor === color ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }"
              @click="selectTextColor(color)"
            />
          </a-space>
          <div style="margin-top: 8px">
            <a-typography-text type="secondary" style="font-size: 12px">
              {{ $t('settings.textColorHint') }}
            </a-typography-text>
          </div>
        </a-form-item>
        
        <!-- Compact Mode Switch -->
        <a-form-item :label="$t('settings.compactMode')">
          <a-space>
            <a-switch
              v-model:checked="formState.compactMode"
              @change="onCompactModeChange"
            />
            <a-typography-text type="secondary">
              {{ formState.compactMode ? $t('settings.compactModeOn') : $t('settings.compactModeOff') }}
            </a-typography-text>
          </a-space>
        </a-form-item>
        
        <!-- Animation Switch -->
        <a-form-item :label="$t('settings.animations')">
          <a-space>
            <a-switch
              v-model:checked="formState.enableAnimations"
              @change="onAnimationsChange"
            />
            <a-typography-text type="secondary">
              {{ formState.enableAnimations ? $t('settings.animationsOn') : $t('settings.animationsOff') }}
            </a-typography-text>
          </a-space>
        </a-form-item>
        
        <!-- Save Button -->
        <a-form-item :wrapper-col="{ xs: { span: 24 }, sm: { offset: 6, span: 14 } }">
          <a-space>
            <a-button type="primary" @click="saveSettings" :loading="saving">
              <SaveOutlined /> {{ $t('settings.save') }}
            </a-button>
            <a-button @click="resetSettings">
              <UndoOutlined /> {{ $t('settings.reset') }}
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- Theme Preview -->
    <a-card style="margin-top: 24px" :title="$t('settings.preview')">
      <a-space wrap :size="16" style="width: 100%">
        <a-button type="primary">Primary Button</a-button>
        <a-button>Default Button</a-button>
        <a-button type="dashed">Dashed Button</a-button>
        <a-button type="text">Text Button</a-button>
        <a-button danger>Danger Button</a-button>
      </a-space>
      
      <a-divider />
      
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :lg="8">
          <a-space direction="vertical" style="width: 100%">
            <a-switch checked />
            <a-checkbox checked>Checkbox</a-checkbox>
            <a-radio checked>Radio</a-radio>
          </a-space>
        </a-col>
        
        <a-col :xs="24" :sm="12" :lg="8">
          <a-space direction="vertical" style="width: 100%">
            <a-input placeholder="Input field" />
            <a-select style="width: 100%" placeholder="Select">
              <a-select-option value="1">Option 1</a-select-option>
              <a-select-option value="2">Option 2</a-select-option>
            </a-select>
            <a-date-picker style="width: 100%" />
          </a-space>
        </a-col>
        
        <a-col :xs="24" :sm="24" :lg="8">
          <a-space direction="vertical" style="width: 100%">
            <a-progress :percent="75" />
            <a-slider :default-value="30" />
            <a-rate :value="4" />
          </a-space>
        </a-col>
      </a-row>
      
      <a-divider />
      
      <a-space wrap>
        <a-tag>Default</a-tag>
        <a-tag color="success">Success</a-tag>
        <a-tag color="processing">Processing</a-tag>
        <a-tag color="error">Error</a-tag>
        <a-tag color="warning">Warning</a-tag>
      </a-space>
    </a-card>
    
    <!-- Live Preview Card -->
    <a-card style="margin-top: 24px" :title="$t('settings.livePreview')">
      <div 
        :style="{
          padding: '20px',
          backgroundColor: formState.primaryColor + '10',
          borderRadius: '8px',
          border: `2px solid ${formState.primaryColor}`
        }"
      >
        <a-typography>
          <a-typography-title 
            :level="3" 
            :style="{ color: formState.textColor }"
          >
            {{ $t('settings.sampleTitle') }}
          </a-typography-title>
          <a-typography-paragraph :style="{ color: formState.textColor + 'CC' }">
            {{ $t('settings.sampleText') }}
          </a-typography-paragraph>
        </a-typography>
        
        <a-space>
          <a-button 
            type="primary"
            :style="{ 
              backgroundColor: formState.primaryColor,
              borderColor: formState.primaryColor 
            }"
          >
            {{ $t('settings.sampleButton') }}
          </a-button>
          <a-button 
            :style="{ 
              color: formState.primaryColor,
              borderColor: formState.primaryColor 
            }"
          >
            {{ $t('settings.sampleButtonSecondary') }}
          </a-button>
        </a-space>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { message } from 'ant-design-vue'
import { SaveOutlined, UndoOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const { themeMode, setTheme, setPrimaryColor, setTextColor: updateTextColor, setCompactMode, setAnimationsEnabled } = useTheme()

// State
const saving = ref(false)

// Preset colors
const presetColors = [
  '#1677ff', // Ant Design Blue
  '#52c41a', // Success Green
  '#faad14', // Warning Orange
  '#f5222d', // Error Red
  '#722ed1', // Purple
  '#13c2c2', // Cyan
  '#eb2f96', // Magenta
  '#fa8c16'  // Orange
]

const textPresetColors = [
  '#000000', // Black
  '#ffffff', // White
  '#595959', // Gray
  '#1890ff', // Blue
  '#52c41a', // Green
  '#fa8c16', // Orange
  '#f5222d', // Red
  '#722ed1'  // Purple
]

// Form state
const formState = reactive({
  theme: themeMode.value,
  primaryColor: localStorage.getItem('primaryColor') || '#1677ff',
  textColor: localStorage.getItem('textColor') || '#000000',
  compactMode: localStorage.getItem('compactMode') === 'true',
  enableAnimations: localStorage.getItem('enableAnimations') !== 'false'
})

// Methods
const onThemeChange = () => {
  setTheme(formState.theme)
}

const onColorChange = () => {
  setPrimaryColor(formState.primaryColor)
}

const onTextColorChange = () => {
  updateTextColor(formState.textColor)
}

const setColor = (color: string) => {
  formState.primaryColor = color
  setPrimaryColor(color)
}

const selectTextColor = (color: string) => {
  formState.textColor = color
  onTextColorChange()
}

const onCompactModeChange = () => {
  setCompactMode(formState.compactMode)
}

const onAnimationsChange = () => {
  setAnimationsEnabled(formState.enableAnimations)
}

const saveSettings = async () => {
  saving.value = true
  try {
    // Симуляція збереження на сервер
    await new Promise(resolve => setTimeout(resolve, 1000))
   
    message.success(t('settings.saveSuccess'))
  } catch (error) {
    message.error(t('settings.saveError'))
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  // Скидання до значень за замовчуванням
  formState.theme = 'auto'
  formState.primaryColor = '#1677ff'
  formState.textColor = '#000000'
  formState.compactMode = false
  formState.enableAnimations = true
  
  // Застосування змін
  onThemeChange()
  onColorChange()
  onTextColorChange()
  onCompactModeChange()
  onAnimationsChange()
  
  message.info(t('settings.resetSuccess'))
}

// Lifecycle
onMounted(() => {
  // Застосування збережених налаштувань
  if (formState.compactMode) {
    document.documentElement.classList.add('compact-mode')
  }
  if (!formState.enableAnimations) {
    document.documentElement.classList.add('no-animations')
  }
})
</script>

<style scoped>
/* Compact mode styles */
:global(.compact-mode) .ant-form-item {
  margin-bottom: 12px;
}

:global(.compact-mode) .ant-card {
  padding: 12px;
}

/* No animations mode */
:global(.no-animations) * {
  transition: none !important;
  animation: none !important;
}
</style>