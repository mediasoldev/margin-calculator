// frontend/src/locales/index.ts

import { createI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import en from './en'
import ua from './ua'
import ru from './ru'
import de from './de'
import fr from './fr'
import it from './it'
import pl from './pl'
import br from './br'
import la from './la'

// Типи для локалізації
export type AvailableLocales = 'en' | 'ua' | 'ru' | 'de' | 'fr' | 'it' | 'pl' | 'br' | 'la'

// Визначаємо мову з BX24 або браузера
const getBrowserLocale = (): string => {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('uk') || browserLang.startsWith('ua')) return 'ua'
  if (browserLang.startsWith('ru')) return 'ru'
  if (browserLang.startsWith('de')) return 'de'
  if (browserLang.startsWith('fr')) return 'fr'
  if (browserLang.startsWith('it')) return 'it'
  if (browserLang.startsWith('pl')) return 'pl'
  if (browserLang.startsWith('pt')) return 'br'
  if (browserLang.startsWith('es')) return 'la'
  return 'en'
}

const defaultLocale = window.BX24?.getLang?.() || getBrowserLocale()

// Мапінг мов Bitrix24 на наші локалі
const localeMap: Record<string, AvailableLocales> = {
  'en': 'en',
  'ua': 'ua',
  'uk': 'ua',
  'ru': 'ru',
  'de': 'de',
  'fr': 'fr',
  'it': 'it',  
  'pl': 'pl',
  'br': 'br',
  'pt': 'br',
  'la': 'la',
  'es': 'la'
}

// Мапінг для dayjs
const dayjsLocaleMap: Record<AvailableLocales, string> = {
  'en': 'en',
  'ua': 'uk',
  'ru': 'ru',
  'de': 'de',
  'fr': 'fr',
  'it': 'it',
  'pl': 'pl',
  'br': 'pt-br',
  'la': 'es'
}

// Створюємо i18n інстанс
export const i18n = createI18n({
  legacy: false,
  locale: localeMap[defaultLocale] || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    ua,
    ru,
    de,
    fr,
    it,
    pl,
    br,
    la
  }
})

// Функція для зміни мови
export function setLanguage(lang: string): AvailableLocales {
  const mappedLang = (localeMap[lang] || 'en') as AvailableLocales
  i18n.global.locale.value = mappedLang
  document.documentElement.lang = mappedLang
  
  // Зберігаємо в localStorage
  localStorage.setItem('app-language', mappedLang)
  
  // Оновлюємо dayjs locale синхронно
  const dayjsLocale = dayjsLocaleMap[mappedLang]
  dayjs.locale(dayjsLocale)
  
  return mappedLang
}

// Отримати поточну мову
export function getCurrentLanguage(): AvailableLocales {
  return i18n.global.locale.value as AvailableLocales
}

// Назви мов для UI
export const languageNames: Record<AvailableLocales, string> = {
  'en': 'English',
  'pl': 'Polski',
  'ru': 'Русский',
  'ua': 'Українська',
  'de': 'Deutsch',
  'fr': 'Français',
  'it': 'Italiano',
  'br': 'Português (BR)',
  'la': 'Español (LA)'
}

// Ініціалізація dayjs locale при старті
const initialDayjsLocale = dayjsLocaleMap[localeMap[defaultLocale] || 'en']
dayjs.locale(initialDayjsLocale)