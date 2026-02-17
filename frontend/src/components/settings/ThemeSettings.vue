<!-- frontend/src/components/settings/ThemeSettings.vue -->

<template>
  <a-form
    :model="formState"
    :label-col="{ xs: 24, sm: 6 }"
    :wrapper-col="{ xs: 24, sm: 14 }"
  >
    <a-form-item :label="$t('settings.theme')">
      <a-radio-group v-model:value="formState.theme" @change="onThemeChange">
        <a-radio-button value="light">{{ $t('settings.light') }}</a-radio-button>
        <a-radio-button value="dark">{{ $t('settings.dark') }}</a-radio-button>
        <a-radio-button value="auto">{{ $t('settings.auto') }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    
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
            border: formState.primaryColor === color ? '2px solid #333' : '1px solid #d9d9d9',
            boxShadow: formState.primaryColor === color ? '0 0 0 3px rgba(0, 0, 0, 0.1)' : 'none',
            transform: formState.primaryColor === color ? 'scale(1.1)' : 'scale(1)'
          }"
          @click="setColor(color)"
        />
      </a-space>
    </a-form-item>
    
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
            border: formState.textColor === color ? '2px solid #333' : '1px solid #d9d9d9',
            boxShadow: formState.textColor === color ? '0 0 0 3px rgba(0, 0, 0, 0.1)' : 'none',
            transform: formState.textColor === color ? 'scale(1.1)' : 'scale(1)'
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
  
  <a-card style="margin-top: 24px" :title="$t('settings.preview')">
    <a-space wrap :size="16" style="width: 100%">
      <a-button type="primary">Primary Button</a-button>
      <a-button>Default Button</a-button>
      <a-button type="dashed">Dashed Button</a-button>
      <a-button type="text">Text Button</a-button>
      <a-button danger>Danger Button</a-button>
    </a-space>
    
    <a-divider />
    
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :lg="8">
        <a-space direction="vertical" style="width: 100%">
          <a-switch v-model:checked="previewSwitch" />
          <a-checkbox v-model:checked="previewCheckbox">Checkbox</a-checkbox>
          <a-radio v-model:checked="previewRadio">Radio</a-radio>
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
          <a-progress :percent="75"  :stroke-color="formState.primaryColor"/>
          <a-slider v-model:value="previewSlider" />
          <a-rate v-model:value="previewRate" />
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
  
  <a-card style="margin-top: 24px" :title="$t('settings.livePreview')">
    <div 
      :style="{
        padding: '20px',
        backgroundColor: adjustColorOpacity(formState.primaryColor, 0.05),
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
        <a-typography-paragraph :style="{ color: adjustColorOpacity(formState.textColor, 0.8) }">
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
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { message } from 'ant-design-vue'
import { SaveOutlined, UndoOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const { themeMode, setTheme, setPrimaryColor, setTextColor: updateTextColor, setCompactMode, setAnimationsEnabled, primaryColor: currentPrimaryColor, textColor: currentTextColor } = useTheme()

const saving = ref(false)

const previewSwitch = ref(true)
const previewCheckbox = ref(true)
const previewRadio = ref(true)
const previewSlider = ref(30)
const previewRate = ref(4)

const presetColors = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16'
]

const textPresetColors = [
  '#000000',
  '#ffffff',
  '#595959',
  '#1890ff',
  '#52c41a',
  '#fa8c16',
  '#f5222d',
  '#722ed1'
]

const formState = reactive({
  theme: themeMode.value,
  primaryColor: currentPrimaryColor.value,
  textColor: currentTextColor.value,
  compactMode: localStorage.getItem('compact-mode') === 'true',
  enableAnimations: localStorage.getItem('enable-animations') !== 'false'
})

const adjustColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('rgb')) {
    const matches = color.match(/\d+/g)
    if (matches && matches.length >= 3) {
      return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${opacity})`
    }
  }
  
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) || 0
  const g = parseInt(hex.substr(2, 2), 16) || 0
  const b = parseInt(hex.substr(4, 2), 16) || 0
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

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
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success(t('settings.saveSuccess') || 'Settings saved successfully')
  } catch (error) {
    message.error(t('settings.saveError') || 'Failed to save settings')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  formState.theme = 'auto'
  formState.primaryColor = '#1677ff'
  formState.textColor = '#000000'
  formState.compactMode = false
  formState.enableAnimations = true
  
  onThemeChange()
  onColorChange()
  onTextColorChange()
  onCompactModeChange()
  onAnimationsChange()
  
  message.info(t('settings.resetSuccess') || 'Settings reset to defaults')
}

watch(() => formState.primaryColor, async (newColor) => {
  await nextTick()
  setPrimaryColor(newColor)
})

watch(() => formState.textColor, async (newColor) => {
  await nextTick()
  updateTextColor(newColor)
})

onMounted(() => {
  if (formState.compactMode) {
    setCompactMode(true)
  }
  if (!formState.enableAnimations) {
    setAnimationsEnabled(false)
  }
})
</script>

<style scoped>
.ant-btn {
  transition: all 0.2s ease;
}

@media (max-width: 576px) {
  .ant-form-item-label {
    text-align: left;
  }
  
  .ant-space {
    width: 100%;
  }
  
  .ant-space-item {
    width: 100%;
  }
}
</style>