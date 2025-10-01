<!-- frontend/src/views/SettingsView.vue -->

<template>
  <div>
    <a-page-header
      :title="$t('settings.title')"
    />
    
    <a-card style="margin-top: 24px">
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-item :label="$t('settings.theme')">
          <a-radio-group v-model:value="formState.theme" @change="onThemeChange">
            <a-radio-button value="light">{{ $t('settings.light') }}</a-radio-button>
            <a-radio-button value="dark">{{ $t('settings.dark') }}</a-radio-button>
            <a-radio-button value="auto">{{ $t('settings.auto') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item :label="$t('settings.language')">
          <a-select v-model:value="formState.language" @change="onLanguageChange">
            <a-select-option value="en">English</a-select-option>
            <a-select-option value="ua">Українська</a-select-option>
            <a-select-option value="ru">Русский</a-select-option>
            <a-select-option value="de">Deutsch</a-select-option>
            <a-select-option value="fr">Français</a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item label="Primary Color">
          <a-space>
            <a-input
              v-model:value="formState.primaryColor"
              type="color"
              style="width: 50px; height: 38px"
              @change="onColorChange"
            />
            <a-button
              v-for="color in presetColors"
              :key="color"
              :style="{ backgroundColor: color, width: '32px', height: '32px' }"
              @click="setColor(color)"
            />
          </a-space>
        </a-form-item>
        
        <a-form-item :wrapper-col="{ offset: 6 }">
          <a-button type="primary" @click="saveSettings">
            {{ $t('settings.save') }}
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
    
    <a-card style="margin-top: 24px" title="Theme Preview">
      <a-space wrap :size="16">
        <a-button type="primary">Primary Button</a-button>
        <a-button>Default Button</a-button>
        <a-button type="dashed">Dashed Button</a-button>
        <a-switch checked />
        <a-date-picker />
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { setLanguage } from '@/locales'
import { message } from 'ant-design-vue'

const { locale } = useI18n()
const { themeMode, setTheme, setPrimaryColor } = useTheme()

const presetColors = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']

const formState = reactive({
  theme: themeMode.value,
  language: locale.value,
  primaryColor: '#1677ff'
})

const onThemeChange = () => {
  setTheme(formState.theme)
}

const onLanguageChange = () => {
  setLanguage(formState.language)
}

const onColorChange = () => {
  setPrimaryColor(formState.primaryColor)
}

const setColor = (color: string) => {
  formState.primaryColor = color
  setPrimaryColor(color)
}

const saveSettings = () => {
  message.success('Settings saved!')
}
</script>