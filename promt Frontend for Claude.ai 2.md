# Технічний промпт для розробки Bitrix24 додатку на Vue 3

## Технічний стек
- **Vue 3.5** + Composition API (`<script setup lang="ts">`)
- **TypeScript** (strict mode)
- **Vite 5** 
- **Ant Design Vue 4** - UI компоненти
- **Pinia** - state management
- **Vue Router 4** - роутинг
- **vue-i18n 9** - мультимовність (en/ua/ru/de/fr/it/pl/br/la)
- **@vueuse/core** - утиліти
- **dayjs** - дати

## Структура файлів

```
frontend/src/
├── components/pages/     # Компоненти сторінок
├── views/                # View-обгортки
├── composables/          # Композабли (useBX24, useTheme)
├── layouts/             # MainLayout.vue
├── locales/             # Переклади
├── router/              # Роутинг
├── stores/              # Pinia stores
└── types/               # TypeScript типи
```

## Створення нової сторінки

### 1. Компонент сторінки
`components/pages/[Name]PageComponent.vue`:

```vue
<template>
  <div>
    <!-- Завжди a-card обгортка -->
    <a-card :title="$t('section.title')">
      <!-- Використовуємо Ant Design компоненти -->
      <!-- a-row/a-col для адаптивності -->
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="12" :lg="8">
          <!-- content -->
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme'
import { useBX24 } from '@/composables/useBX24'
import { message } from 'ant-design-vue'
// Іконки імпортуємо окремо
import { SaveOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const { primaryColor, textColor } = useTheme()
const bx24 = useBX24()

// Типізація всіх даних
interface DataType {
  id: number
  name: string
}

// State
const loading = ref(false)
const data = reactive<DataType>({
  id: 1,
  name: ''
})
</script>

<style scoped>
/* Адаптивність обов'язкова */
@media (max-width: 768px) {
  .content {
    padding: 12px;
  }
}

/* Темна тема підтримка */
:global(.dark) .element {
  background: rgba(255, 255, 255, 0.04);
}
</style>
```

### 2. View файл
`views/[Name]View.vue`:

```vue
<template>
  <div>
    <[Name]PageComponent />
  </div>
</template>

<script setup lang="ts">
import [Name]PageComponent from '@/components/pages/[Name]PageComponent.vue'
</script>
```

### 3. Роутинг
В `router/index.ts`:

```typescript
{
  path: '/[route-name]',
  name: '[routeName]',
  component: () => import('@/views/[Name]View.vue')
}
```

### 4. Переклади
В `locales/en/index.ts` (інші мови аналогічно):

```typescript
[section]: {
  title: 'Title',
  field: 'Field Name',
  action: 'Action',
  success: 'Success message',
  error: 'Error message'
}
```

## Ant Design компоненти - правила використання

### Форми
```vue
<a-form
  :model="formState"
  :label-col="{ xs: 24, sm: 6 }"
  :wrapper-col="{ xs: 24, sm: 14 }"
>
  <a-form-item :label="$t('label')">
    <a-input v-model:value="formState.field" />
  </a-form-item>
</a-form>
```

### Таблиці
```vue
const columns = [
  {
    title: t('column.name'),
    key: 'name',
    slots: { customRender: 'name' },
    width: 200
  }
]

<a-table
  :columns="columns"
  :data-source="data"
  :pagination="false"
  row-key="id"
>
  <template #name="{ record }">
    <a-input v-model:value="record.name" />
  </template>
</a-table>
```

### Адаптивна сітка
```vue
<a-row :gutter="[16, 16]">
  <a-col :xs="24" :sm="12" :md="8" :lg="6">
    <!-- xs: мобільні, sm: планшети, md: ноутбуки, lg: десктопи -->
  </a-col>
</a-row>
```

## useTheme композабл

```typescript
const { 
  isDark,           // readonly ref - чи темна тема
  themeMode,        // 'light' | 'dark' | 'auto'
  primaryColor,     // основний колір
  textColor,        // колір тексту
  setTheme,         // функція зміни теми
  setPrimaryColor,  // функція зміни основного кольору
  setTextColor      // функція зміни кольору тексту
} = useTheme()
```

### Динамічні кольори
```vue
:style="{ 
  backgroundColor: primaryColor,
  color: textColor
}"
```

### CSS змінні
```css
var(--primary-color)
var(--text-color)
```

## useBX24 композабл

```typescript
const bx24 = useBX24()

// Перевірка готовності
if (bx24.isReady.value) {
  // API виклики
  const result = await bx24.callMethod('user.current')
  
  // Авторесайз фрейму
  bx24.fitWindow()
}
```

## Стилізація

### Компактний режим
```css
:global(.compact-mode) .element {
  padding: 8px; /* замість 16px */
}
```

### Без анімацій
```css
:global(.no-animations) * {
  transition: none !important;
}
```

### Темна тема
```css
:global(.dark) .element {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.85);
}
```

## Важливі патерни

### Кнопки з динамічним кольором тексту
```vue
<a-progress :percent="75" :stroke-color="formState.primaryColor" />
```

### Виділення вибраного елемента
```vue
:style="{
  border: selected === item.id ? '2px solid #333' : '1px solid #d9d9d9',
  boxShadow: selected === item.id ? '0 0 0 3px rgba(0, 0, 0, 0.1)' : 'none',
  transform: selected === item.id ? 'scale(1.1)' : 'scale(1)'
}"
```

### Конвертація валют
```typescript
const convertToPLN = (amount: number, currency: string): number => {
  if (currency === 'PLN') return amount
  if (currency === 'USD') return amount * exchangeRates.usdToPln
  if (currency === 'EUR') return amount * exchangeRates.eurToPln
  return amount
}
```

### Обробка помилок
```typescript
try {
  loading.value = true
  const result = await bx24.callMethod('method')
  message.success(t('success'))
} catch (error) {
  message.error(t('error'))
} finally {
  loading.value = false
}
```
## Layout система для Bitrix24 додатку

### Два типи layouts:
1. **MainLayout** - з хедером, меню, перемикачами теми (для основного додатку)
2. **WidgetLayout** - без хедера (для вбудованих віджетів)

### Використання в роутах:

```typescript
// Сторінка з хедером
{
  path: '/settings',
  component: () => import('@/views/SettingsView.vue'),
  meta: { layout: 'main' }
}

// Віджет без хедера
{
  path: '/pricing-calculator',
  component: () => import('@/views/PricingCalculatorView.vue'),
  meta: { layout: 'widget' }
}
```

### Файлова структура:
```
src/layouts/
├── MainLayout.vue      # Layout з хедером
└── WidgetLayout.vue    # Layout для віджетів
```

### App.vue автоматично вибирає layout:
```typescript
const layoutComponent = computed(() => {
  const layoutType = route.meta?.layout || 'main'
  return layoutType === 'widget' ? WidgetLayout : MainLayout
})
```

### Коли використовувати widget layout:
- Сторінка буде вбудована як iframe в Bitrix24
- Не потрібна навігація додатку
- Калькулятори, форми, звіти як окремі віджети
- Placement handlers для Bitrix24

### Коли використовувати main layout:
- Повноцінні сторінки додатку
- Потрібна навігація між розділами
- Налаштування, профіль, основні розділи


## Hybrid API система для Bitrix24

### Концепція
Система автоматично вибирає джерело даних (прямий виклик BX24 або проксі через backend) на основі конфігурації. Це необхідно для випадків, коли користувач має обмежені права доступу.

### Файлова структура
```
src/api/
├── config/
│   └── routing.ts          # Конфігурація маршрутизації
├── DirectAPI.ts            # Прямі виклики BX24
├── ProxyAPI.ts             # Виклики через backend
├── HybridClient.ts         # Основний клієнт
└── index.ts                # Публічні методи
```

### Використання в компонентах

#### Базове використання:
```typescript
import { hybridClient } from '@/api'

// Автоматичний вибір джерела на основі конфігурації
const products = await hybridClient.call('crm.deal.productrows.get', { id: dealId })

// Примусове використання proxy для методів з підвищеними правами
const result = await hybridClient.call(
  'entity.item.update',
  { id: 1, data: {...} },
  { forceSource: 'proxy' }
)

// З кешуванням
const suppliers = await hybridClient.call(
  'entity.item.get',
  { entityTypeId: 'SUPPLIERS' },
  { useCache: true }
)
```

#### В компонентах сторінок:
```typescript
// У будь-якому компоненті
const loadData = async () => {
  loading.value = true
  try {
    // Метод автоматично визначить джерело з routing.ts
    const response = await hybridClient.call('crm.product.list')
    products.value = response.data
  } catch (error) {
    message.error('Failed to load products')
  } finally {
    loading.value = false
  }
}
```

### Конфігурація роутингу

В файлі `routing.ts` явно вказано маршрутизацію:

```typescript
export const apiRouting = {
  methods: {
    // Прямі виклики - працюють під правами користувача
    'crm.deal.get': 'direct',
    'crm.product.list': 'direct',
    
    // Proxy виклики - потребують адмін прав
    'crm.deal.update': 'proxy',
    'entity.item.add': 'proxy'
  },
  
  patterns: [
    // Паттерни для груп методів
    { pattern: '^user\\.admin', source: 'proxy' },
    { pattern: '\\.delete$', source: 'proxy' }
  ],
  
  default: 'direct'
}
```

### Правила використання

1. **Читання даних** - зазвичай `direct`
2. **Запис/оновлення** - зазвичай `proxy`
3. **Кастомні сутності** - завжди `proxy`
4. **Batch запити** - автоматично групуються по джерелах

### Обробка помилок

```typescript
try {
  const result = await hybridClient.call('crm.deal.update', data)
} catch (error) {
  if (error.code === 'ACCESS_DENIED') {
    // Користувач не має прав - використати proxy
    const result = await hybridClient.call(
      'crm.deal.update',
      data,
      { forceSource: 'proxy' }
    )
  }
}
```

### Створення нових API методів

```typescript
// В api/index.ts
export const myCustomMethod = async (params: any) => {
  // Визначити метод і джерело в routing.ts
  // Потім використовувати:
  const response = await hybridClient.call('my.custom.method', params)
  return response.data
}
```

### Backend вимоги

Backend повинен мати endpoint `/api/bitrix24/call` який:
1. Приймає `{ method, params }`
2. Використовує збережені OAuth токени
3. Повертає результат в форматі `{ result: data }`

### Критичні моменти

- **Завжди додавати нові методи в routing.ts** перед використанням
- **Proxy методи потребують налаштованого backend** з OAuth
- **Direct методи працюють тільки в iframe Bitrix24**
- **Кешування за замовчуванням 5 хвилин** для читання даних

## Build

```bash
npm run build  # -> ../public/app/
```

Build інтегрується з PHP backend в папку `public/app/`.

## Критичні вимоги

1. **Типізація** - всі refs, reactive, props, emits типізовані
2. **Адаптивність** - обов'язкові breakpoints xs/sm/md/lg
3. **Темна тема** - всі компоненти підтримують
4. **Переклади** - використовуємо $t() для всього тексту
5. **Ant Design** - тільки офіційні компоненти
6. **CSS змінні** - для динамічних кольорів
7. **Composition API** - ніякого Options API



---------------------------------------------
Також створіть `.env` файл для налаштування:

```env
# frontend/.env
VITE_BACKEND_URL=http://localhost:8000/api
```

**Що потрібно зробити на backend:**

1. Створити endpoint `/api/bitrix24/call`:
```php
// Приклад для PHP backend
public function proxyCall(Request $request) {
    $method = $request->input('method');
    $params = $request->input('params', []);
    
    // Використати збережені OAuth токени
    $result = CRest::call($method, $params);
    
    return response()->json([
        'success' => true,
        'result' => $result
    ]);
}
```

2. Створити endpoint `/api/bitrix24/batch`:
```php
public function proxyBatch(Request $request) {
    $calls = $request->input('calls');
    $batch = [];
    
    foreach ($calls as $index => $call) {
        $batch["cmd_{$index}"] = [$call['method'], $call['params'] ?? []];
    }
    
    $result = CRest::callBatch($batch);
    
    return response()->json([
        'success' => true,
        'results' => array_values($result)
    ]);
}
```