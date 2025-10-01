## Промт для Claude.ai - Frontend частина Bitrix24 App Template

### Контекст проекту
Розробляємо **Веб застосунок для Bitrix24**. Frontend частина - це SPA на Vue 3, яка працює в iframe всередині Bitrix24.

### Технічний стек Frontend

#### Core:
- **Vue 3.5** з Composition API та `<script setup>`
- **TypeScript** - суворий режим, всі компоненти типізовані
- **Vite 5** - збірка та dev server
- **Node.js 18+** / npm 9+

#### UI та стилізація:
- **Ant Design Vue 4** - основна бібліотека компонентів
- **@ant-design/icons-vue** - іконки
- **SASS** - препроцесор стилів
- **CSS змінні** для темізації

#### State та роутинг:
- **Vue Router 4** - клієнтський роутинг
- **Pinia** - state management (заміна Vuex)
- **@vueuse/core** - утиліти та composables

#### Інтернаціоналізація:
- **vue-i18n 9** - підтримка 9 мов Bitrix24
- Мови: en, ua, ru, de, fr, it, pl, br, la
- **dayjs** - форматування дат з локалізацією

#### Інтеграція:
- **Bitrix24 JS SDK** - через window.BX24
- **Axios** - HTTP клієнт з retry та interceptors

### Структура проекту

```
frontend/
├── src/
│   ├── api/              # API клієнти та методи
│   ├── assets/           # Статичні файли
│   ├── components/       # Reusable компоненти
│   ├── composables/      # Composition API функції
│   │   ├── useBX24.ts   # Bitrix24 SDK wrapper
│   │   └── useTheme.ts  # Управління темою
│   ├── layouts/          # Layout компоненти
│   │   └── MainLayout.vue # Основний layout з меню
│   ├── locales/          # Переклади для 9 мов
│   │   ├── index.ts     # i18n конфігурація
│   │   └── [lang]/index.ts # Переклади кожної мови
│   ├── router/           # Vue Router конфігурація
│   │   └── index.ts
│   ├── stores/           # Pinia stores
│   │   └── app.ts       # Основний store
│   ├── types/            # TypeScript типи
│   │   └── bitrix24.d.ts # Типи для BX24
│   ├── utils/            # Утиліти та helpers
│   ├── views/            # Сторінки додатку
│   │   ├── HomeView.vue
│   │   ├── SettingsView.vue
│   │   └── AboutView.vue
│   ├── App.vue          # Кореневий компонент
│   ├── main.ts          # Entry point
│   └── env.d.ts         # Vite типи
├── index.html           # HTML template
├── vite.config.ts       # Vite конфігурація
├── tsconfig.json        # TypeScript конфігурація
└── package.json
```

### Архітектурні принципи

#### 1. Composition API Pattern:
```typescript
// Завжди використовуємо <script setup lang="ts">
// Імпорти групуємо: vue, libraries, composables, components, types
// Реактивність через ref/reactive/computed
// Ніколи не використовуємо Options API
```

#### 2. Компонентна структура:
- **Views** - сторінки (роути)
- **Layouts** - обгортки з навігацією
- **Components** - переиспользуемі частини
- **Composables** - бізнес логіка

#### 3. Типізація:
- Всі props, emits, refs типізовані
- Використовуємо TypeScript enums та interfaces
- Ніколи не використовуємо any без крайньої потреби

#### 4. Стилі:
- Scoped styles в компонентах
- CSS змінні для темізації
- Підтримка світлої/темної теми через html класи

### Створення нової сторінки

1. **Створити view компонент** в `src/views/`:
```vue
<!-- src/views/NewPageView.vue -->
<template>
  <div>
    <a-page-header :title="$t('newPage.title')" />
    <!-- content -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBX24 } from '@/composables/useBX24'
</script>
```

2. **Додати роут** в `src/router/index.ts`:
```typescript
{
  path: '/new-page',
  name: 'newPage',
  component: () => import('@/views/NewPageView.vue')
}
```

3. **Додати переклади** в всі мовні файли:
```typescript
// src/locales/en/index.ts
newPage: {
  title: 'New Page',
  // ...
}
```

4. **Додати пункт меню** в `MainLayout.vue`

### Інтеграція з Bitrix24

#### BX24 SDK доступний через composable:
```typescript
const bx24 = useBX24()

// Перевірка готовності
if (bx24.isReady.value) {
  // API виклики
  const user = await bx24.callMethod('user.current')
  
  // Авто-ресайз фрейму
  bx24.fitWindow()
}
```

#### Особливості:
- Додаток працює в iframe
- Автоматичний ресайз через BX24.fitWindow()
- Мова синхронізується з BX24.getLang()
- OAuth токени в backend, frontend працює через проксі

### Управління станом (Pinia)

```typescript
// src/stores/newStore.ts
export const useNewStore = defineStore('new', () => {
  // State
  const items = ref<Item[]>([])
  const loading = ref(false)
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Actions
  const fetchItems = async () => {
    loading.value = true
    // ...
  }
  
  return { items, loading, itemCount, fetchItems }
})
```

### Налаштування теми

Тема керується через `useTheme()` composable:
- Зберігається в localStorage
- Підтримка light/dark режимів
- Зміна через ConfigProvider Ant Design
- CSS класи на `<html>` елементі

### Build та deployment

```bash
# Development
npm run dev          # localhost:5173

# Production build
npm run build        # -> ../public/app/

# Type checking
npm run type-check
```

**Build йде в `../public/app/`** для інтеграції з PHP backend.

### Важливі особливості

1. **Мобільна адаптивність**: breakpoints 768px, 992px
2. **i18n**: 9 мов, автодетект з BX24
3. **Темна тема**: повна підтримка через CSS змінні
4. **TypeScript**: суворий режим, всюди типи
5. **Bitrix24 iframe**: авторесайз, BX24 API
6. **Ant Design**: ConfigProvider для локалізації компонентів

### Команди розробки

```bash
npm install         # Встановити залежності
npm run dev        # Запустити dev server
npm run build      # Production build
npm run preview    # Переглянути production build
npm run type-check # Перевірка типів
```

### Проблеми та рішення

1. **dayjs dynamic import error**: Не використовувати динамічні імпорти локалей
2. **Ant Design icons**: Імпортувати кожну іконку окремо
3. **Тема не змінюється повністю**: Додати CSS класи на html елемент
4. **Меню схлопується на мобільному**: Використати Drawer для мобільного меню