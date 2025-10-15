// frontend/src/composables/usePricingCalculations.ts

import { ref, computed, type Ref } from 'vue'
import type { Product, ExchangeRates, Totals, ProductCalculation } from '@/types/pricing.types'
import { useCurrencyConversion } from './useCurrencyConversion'

export function usePricingCalculations(
  products: Ref<Product[]>,
  exchangeRates: Ref<ExchangeRates>
) {
  const { convertToPLN } = useCurrencyConversion(exchangeRates)

  /**
   * Calculate all margin values for a product
   */
  const calculateProductValues = (product: Product): ProductCalculation => {
    const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency)
    const purchasePricePLN = convertToPLN(product.purchasePrice, product.purchaseCurrency)
    const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency)
    const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency)

    const revenue = salePricePLN * product.quantity
    const totalCost = (purchasePricePLN * product.quantity) + transportPLN + packagingPLN
    const totalMargin = revenue - totalCost
    const marginPerUnit = totalMargin / product.quantity
    const marginPercent = revenue > 0 ? (totalMargin / revenue) * 100 : 0

    // Update internal fields
    product._totalMarginInput = totalMargin
    product._marginPercentInput = marginPercent
    product._marginPerUnitInput = marginPerUnit
    product._marginAmount = marginPerUnit

    return {
      totalMargin,
      marginPercent,
      marginPerUnit,
      revenue,
      totalCost,
    }
  }

  /**
   * Recalculate purchase price from margin percent
   */
  const recalculateFromMarginPercent = (product: Product): void => {
    const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency)
    const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency)
    const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency)
    
    const revenue = salePricePLN * product.quantity
    const desiredMargin = revenue * ((product._marginPercentInput || 0) / 100)
    const totalCost = revenue - desiredMargin
    const purchaseCostTotal = totalCost - transportPLN - packagingPLN
    const purchasePricePerUnit = purchaseCostTotal / product.quantity
    
    product.purchasePrice = Math.max(0, purchasePricePerUnit)
    product.purchaseCurrency = 'PLN'
    product._totalMarginInput = desiredMargin
    product._marginPerUnitInput = desiredMargin / product.quantity
    product._marginAmount = desiredMargin / product.quantity
  }

  /**
   * Recalculate purchase price from total margin
   */
  const recalculateFromTotalMargin = (product: Product): void => {
    const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency)
    const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency)
    const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency)
    
    const revenue = salePricePLN * product.quantity
    const desiredMargin = product._totalMarginInput || 0
    const totalCost = revenue - desiredMargin
    const purchaseCostTotal = totalCost - transportPLN - packagingPLN
    const purchasePricePerUnit = purchaseCostTotal / product.quantity
    
    product.purchasePrice = Math.max(0, purchasePricePerUnit)
    product.purchaseCurrency = 'PLN'
    product._marginPercentInput = revenue > 0 ? (desiredMargin / revenue) * 100 : 0
    product._marginPerUnitInput = desiredMargin / product.quantity
    product._marginAmount = desiredMargin / product.quantity
  }

  /**
   * Recalculate purchase price from margin per unit
   */
  const recalculateFromMarginPerUnit = (product: Product): void => {
    const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency)
    const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency)
    const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency)
    
    const desiredMarginPerUnit = product._marginPerUnitInput || 0
    const desiredTotalMargin = desiredMarginPerUnit * product.quantity
    
    const revenue = salePricePLN * product.quantity
    const totalCost = revenue - desiredTotalMargin
    const purchaseCostTotal = totalCost - transportPLN - packagingPLN
    const purchasePricePerUnit = purchaseCostTotal / product.quantity
    
    product.purchasePrice = Math.max(0, purchasePricePerUnit)
    product.purchaseCurrency = 'PLN'
    product._totalMarginInput = desiredTotalMargin
    product._marginPercentInput = revenue > 0 ? (desiredTotalMargin / revenue) * 100 : 0
    product._marginAmount = desiredMarginPerUnit
  }

  /**
   * Recalculate all products
   */
  const recalculateAll = (): void => {
    products.value.forEach(product => {
      calculateProductValues(product)
    })
  }

  /**
   * Computed totals
   */
  const totals = computed<Totals>(() => {
    const amount = products.value.reduce((sum, product) => {
      return sum + convertToPLN(product.salePrice * product.quantity, product.saleCurrency)
    }, 0)

    const margin = products.value.reduce((sum, product) => {
      return sum + (product._totalMarginInput || 0)
    }, 0)

    return { amount, margin }
  })

  return {
    calculateProductValues,
    recalculateFromMarginPercent,
    recalculateFromTotalMargin,
    recalculateFromMarginPerUnit,
    recalculateAll,
    totals,
  }
}