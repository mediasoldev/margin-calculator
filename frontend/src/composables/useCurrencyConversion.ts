// frontend/src/composables/useCurrencyConversion.ts

import { computed, type Ref } from 'vue'
import type { Currency, ExchangeRates } from '@/types/pricing.types'

export function useCurrencyConversion(exchangeRates: Ref<ExchangeRates>) {
  /**
   * Convert any currency to PLN
   */
  const convertToPLN = (amount: number, currency: Currency): number => {
    if (currency === 'PLN') return amount
    if (currency === 'USD') return amount * exchangeRates.value.usdToPln
    if (currency === 'EUR') return amount * exchangeRates.value.eurToPln
    return amount
  }

  /**
   * Convert PLN to any currency
   */
  const convertFromPLN = (amount: number, currency: Currency): number => {
    if (currency === 'PLN') return amount
    if (currency === 'USD') return amount / exchangeRates.value.usdToPln
    if (currency === 'EUR') return amount / exchangeRates.value.eurToPln
    return amount
  }

  /**
   * Format currency value with symbol
   */
  const formatCurrency = (amount: number, currency: Currency): string => {
    return `${amount.toFixed(2)} ${currency}`
  }

  /**
   * Get color for margin value
   */
  const getMarginColor = (margin: number): string => {
    if (margin > 0) return '#52c41a'
    if (margin < 0) return '#f5222d'
    return '#8c8c8c'
  }

  /**
   * Reactive check if exchange rates are valid
   */
  const areRatesValid = computed(() => {
    return (
      exchangeRates.value.usdToPln > 0 &&
      exchangeRates.value.eurToPln > 0 &&
      exchangeRates.value.eurToUsd > 0
    )
  })

  return {
    convertToPLN,
    convertFromPLN,
    formatCurrency,
    getMarginColor,
    areRatesValid,
  }
}