// frontend/src/main.ts

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'
import { i18n } from './locales'

// Import Ant Design styles
import 'ant-design-vue/dist/reset.css'

// Import dayjs for date components
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/uk'
import 'dayjs/locale/ru'
import 'dayjs/locale/de'
import 'dayjs/locale/fr'
import 'dayjs/locale/it'
import 'dayjs/locale/pl'
import 'dayjs/locale/pt-br'
import 'dayjs/locale/es'

// Set default dayjs locale
dayjs.locale('en')

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(Antd)

// Mount app
app.mount('#app')

// Add Bitrix24 script if in iframe
if (window.self !== window.top) {
  const script = document.createElement('script')
  script.src = '//api.bitrix24.com/api/v1/'
  document.head.appendChild(script)
}