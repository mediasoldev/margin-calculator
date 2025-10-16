# Pricing Services API - Usage Examples

## Quick Start

### In Vue Component

```typescript
import { usePricingData } from '@/composables/usePricingData'

const { 
  products,
  suppliers,
  loading,
  initialize,
  saveCalculation 
} = usePricingData()

// On mount
await initialize()
```

---

## Service Layer Examples

### 1. Direct Service Usage (without composable)

```typescript
import { pricingDataService } from '@/services/pricing/PricingDataService'

// Load all data
const data = await pricingDataService.loadDealData('123')

// Save calculation
await pricingDataService.saveCalculation(
  '123',
  products,
  exchangeRates,
  totals
)
```

---

### 2. Working with Products

```typescript
import { productService } from '@/services/pricing/ProductService'

// Get products from deal
const products = await productService.getDealProducts('123')

// Get product fields
const fields = await productService.getProductFields()

// Search products
const results = await productService.searchProducts('keyboard')
```

---

### 3. Working with Storage

```typescript
import { storageService } from '@/services/pricing/StorageService'

// Get saved calculation
const calc = await storageService.getCalculation('deal_123')

// Save calculation
await storageService.saveCalculation('deal_123', data)

// Get supplier prices
const prices = await storageService.getSupplierPrices('product_456')
```

---

### 4. Batch Requests

```typescript
import { BatchRequestBuilder } from '@/services/bitrix24/BatchRequestBuilder'

const batch = new BatchRequestBuilder()
  .add('deal', 'crm.deal.get', { id: '123' })
  .add('products', 'crm.deal.productrows.get', { id: '123' })
  .add('companies', 'crm.company.list', { select: ['ID', 'TITLE'] })

const results = await batch.execute()

console.log(results.result.deal)
console.log(results.result.products)
console.log(results.result.companies)
```

---

### 5. Error Handling

```typescript
try {
  await pricingDataService.loadDealData(dealId)
} catch (error) {
  if (error.message.includes('not found')) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

---

## Architecture Flow

```
Component (PricingCalculatorComponent.vue)
    ↓
Composable (usePricingData.ts)
    ↓
Orchestrator (PricingDataService.ts)
    ↓ ↓ ↓
DealService  ProductService  StorageService  CompanyService
    ↓ ↓ ↓ ↓
BatchRequestBuilder
    ↓
Bitrix24Service (BX24 SDK wrapper)
    ↓
BX24.callBatch / BX24.callMethod
```

---

## Best Practices

1. **Always use composable in components** - don't call services directly
2. **Batch when possible** - combine multiple API calls
3. **Handle errors** - always wrap async calls in try/catch
4. **Show loading states** - use loading ref from composable
5. **Cache when appropriate** - store frequently used data

---

## Testing

Each service can be tested independently:

```typescript
// Mock BX24Service
jest.mock('@/services/bitrix24/Bitrix24Service')

// Test ProductService
const products = await productService.getDealProducts('123')
expect(products).toHaveLength(5)
```