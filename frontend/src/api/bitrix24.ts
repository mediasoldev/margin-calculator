// frontend/src/api/bitrix24.ts

// Product types
export interface BitrixProduct {
  id: string
  name: string
  quantity: number
  salePrice: number
  saleCurrency: string
  purchasePrice: number
  purchaseCurrency: string
  transportCost: number
  transportCurrency: string
  packagingCost: number
  packagingCurrency: string
  supplierId?: string
  supplierPrice?: number
  customFields?: Record<string, any>
}

export interface BitrixSupplier {
  id: string
  name: string
  inn?: string
  address?: string
}

export interface SupplierPrice {
  amount: number
  currency: string
  supplierId: string
  productId: string
}

export interface ColumnConfig {
  key: string
  title: string
  required: boolean
  type: 'number' | 'text' | 'select' | 'currency'
  width?: number
}

// Fetch products from current deal
export const fetchProductsFromBitrix = async (): Promise<BitrixProduct[]> => {
  // TODO: Implement actual Bitrix24 API call
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Pink Paradise Slippers',
          quantity: 1,
          salePrice: 355,
          saleCurrency: 'PLN',
          purchasePrice: 0,
          purchaseCurrency: 'PLN',
          transportCost: 0,
          transportCurrency: 'PLN',
          packagingCost: 0,
          packagingCurrency: 'PLN'
        }
      ])
    }, 500)
  })
}

// Fetch suppliers list
export const fetchSuppliersFromBitrix = async (): Promise<BitrixSupplier[]> => {
  // TODO: Implement actual Bitrix24 API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Supplier A', inn: '1234567890' },
        { id: '2', name: 'Supplier B', inn: '0987654321' },
        { id: '3', name: 'Supplier C', inn: '5555555555' }
      ])
    }, 300)
  })
}

// Fetch supplier price for product
export const fetchSupplierPrice = async (
  productId: string, 
  supplierId: string
): Promise<SupplierPrice | null> => {
  // TODO: Implement actual Bitrix24 API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: return saved price if exists
      const mockPrices: Record<string, SupplierPrice> = {
        '1-1': { amount: 250, currency: 'PLN', supplierId: '1', productId: '1' },
        '1-2': { amount: 60, currency: 'USD', supplierId: '2', productId: '1' }
      }
      resolve(mockPrices[`${productId}-${supplierId}`] || null)
    }, 200)
  })
}

// Save supplier price
export const saveSupplierPrice = async (price: SupplierPrice): Promise<boolean> => {
  // TODO: Implement actual Bitrix24 API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Saving supplier price:', price)
      resolve(true)
    }, 300)
  })
}

// Save calculation to deal
export const saveDealToBitrix = async (data: {
  products: BitrixProduct[]
  totals: { amount: number; margin: number }
  exchangeRates: Record<string, number>
}): Promise<boolean> => {
  // TODO: Implement actual Bitrix24 API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Saving to Bitrix24 deal:', data)
      
      // Mock validation
      if (data.products.length === 0) {
        reject(new Error('No products to save'))
        return
      }
      
      resolve(true)
    }, 1000)
  })
}

// Fetch dynamic column configuration
export const fetchColumnConfiguration = async (): Promise<ColumnConfig[]> => {
  // TODO: Implement actual Bitrix24 API call
  // This would fetch custom fields from product catalog
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          key: 'customField1',
          title: 'Custom Field 1',
          required: false,
          type: 'text',
          width: 150
        },
        {
          key: 'customField2',
          title: 'Custom Field 2',
          required: false,
          type: 'number',
          width: 120
        }
      ])
    }, 400)
  })
}

// Get current deal ID from Bitrix24 placement
export const getCurrentDealId = (): string | null => {
  // TODO: Get from BX24.placement.info()
  if (window.BX24) {
    try {
      const placementInfo = window.BX24.placement.info()
      return placementInfo?.options?.ID || null
    } catch {
      return null
    }
  }
  return null
}

// Load deal products
export const loadDealProducts = async (dealId: string): Promise<BitrixProduct[]> => {
  // TODO: Implement actual Bitrix24 API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Loading products for deal:', dealId)
      resolve([])
    }, 500)
  })
}

// Update deal fields
export const updateDealFields = async (
  dealId: string, 
  fields: Record<string, any>
): Promise<boolean> => {
  // TODO: Implement actual Bitrix24 API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Updating deal fields:', dealId, fields)
      resolve(true)
    }, 500)
  })
}