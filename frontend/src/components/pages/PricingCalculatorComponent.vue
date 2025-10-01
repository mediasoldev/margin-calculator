<!-- frontend/src/components/pages/PricingCalculatorComponent.vue -->

<template>
  <div class="pricing-calculator">
    <!-- Currency Exchange Rates Section -->
    <a-card :title="$t('pricing.currencyInfo')" class="mb-4">
      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :sm="8">
          <a-space align="center">
            <span class="currency-label">USD / PLN</span>
            <a-input-number
              v-model:value="exchangeRates.usdToPln"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 100px"
            />
          </a-space>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-space align="center">
            <span class="currency-label">EUR / PLN</span>
            <a-input-number
              v-model:value="exchangeRates.eurToPln"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 100px"
            />
          </a-space>
        </a-col>
        <a-col :xs="24" :sm="8">
          <a-space align="center">
            <span class="currency-label">EUR / USD</span>
            <a-input-number
              v-model:value="exchangeRates.eurToUsd"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 100px"
            />
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- Products Table -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="products"
        :pagination="false"
        row-key="id"
        class="pricing-table"
      >
        <!-- Product Name -->
        <template #product="{ record }">
          <a-input
            v-model:value="record.name"
            :placeholder="$t('pricing.productName')"
          />
        </template>

        <!-- Quantity -->
        <template #quantity="{ record }">
          <a-input-number
            v-model:value="record.quantity"
            :min="0"
            style="width: 100%"
          />
        </template>

        <!-- Sale Price -->
        <template #salePrice="{ record }">
          <a-input-number
            v-model:value="record.salePrice"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%; background-color: #fffbe6;"
          />
        </template>

        <!-- Sale Currency -->
        <template #saleCurrency="{ record }">
          <a-select v-model:value="record.saleCurrency" style="width: 80px">
            <a-select-option value="PLN">PLN</a-select-option>
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="EUR">EUR</a-select-option>
          </a-select>
        </template>

        <!-- Purchase Price -->
        <template #purchasePrice="{ record }">
          <a-input-number
            v-model:value="record.purchasePrice"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </template>

        <!-- Purchase Currency -->
        <template #purchaseCurrency="{ record }">
          <a-select v-model:value="record.purchaseCurrency" style="width: 80px">
            <a-select-option value="PLN">PLN</a-select-option>
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="EUR">EUR</a-select-option>
          </a-select>
        </template>

        <!-- Transport Cost -->
        <template #transportCost="{ record }">
          <a-input-number
            v-model:value="record.transportCost"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </template>

        <!-- Transport Currency -->
        <template #transportCurrency="{ record }">
          <a-select v-model:value="record.transportCurrency" style="width: 80px">
            <a-select-option value="PLN">PLN</a-select-option>
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="EUR">EUR</a-select-option>
          </a-select>
        </template>

        <!-- Packaging Cost -->
        <template #packagingCost="{ record }">
          <a-input-number
            v-model:value="record.packagingCost"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
          />
        </template>

        <!-- Packaging Currency -->
        <template #packagingCurrency="{ record }">
          <a-select v-model:value="record.packagingCurrency" style="width: 80px">
            <a-select-option value="PLN">PLN</a-select-option>
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="EUR">EUR</a-select-option>
          </a-select>
        </template>

        <!-- Actions -->
        <template #action="{ record }">
          <a-button
            type="text"
            danger
            @click="removeProduct(record.id)"
          >
            <DeleteOutlined />
          </a-button>
        </template>
      </a-table>

      <!-- Add Product Button -->
      <a-button
        type="dashed"
        block
        style="margin-top: 16px"
        @click="addProduct"
      >
        <PlusOutlined /> {{ $t('pricing.addProduct') }}
      </a-button>

      <!-- Summary Section -->
      <a-row style="margin-top: 24px" :gutter="[16, 16]">
        <a-col :xs="24" :sm="12">
          <div class="summary-section">
            <div class="summary-item">
              <span class="summary-label">{{ $t('pricing.totalAmount') }}:</span>
              <span class="summary-value">{{ formatCurrency(calculateTotal(), 'PLN') }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">{{ $t('pricing.totalMargin') }}:</span>
              <span class="summary-value">{{ formatCurrency(calculateMargin(), 'PLN') }}</span>
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="12" style="text-align: right">
          <a-button type="primary" size="large" @click="saveCalculation">
            {{ $t('pricing.save') }}
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <!-- Alternative View with Margin Percentage -->
    <a-card :title="$t('pricing.marginCalculation')" style="margin-top: 24px">
      <a-table
        :columns="marginColumns"
        :data-source="products"
        :pagination="false"
        row-key="id"
      >
        <!-- Product Display -->
        <template #productDisplay="{ record }">
          {{ record.name || $t('pricing.unnamed') }}
        </template>

        <!-- Packaging -->
        <template #packaging="{ record }">
          <a-input-number
            v-model:value="record.packaging"
            :min="0"
            style="width: 100%"
          />
        </template>

        <!-- Purchase Price Display -->
        <template #purchasePriceDisplay="{ record }">
          {{ formatCurrency(convertToPLN(record.purchasePrice, record.purchaseCurrency), 'PLN') }}
        </template>

        <!-- Margin Percentage -->
        <template #marginPercent="{ record }">
          <a-input-number
            v-model:value="record.marginPercent"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="1"
            style="width: 100%"
            :formatter="(value: any) => `${value}%`"
            :parser="(value: any) => value.replace('%', '')"
            @change="updatePriceFromMargin(record)"
          />
        </template>

        <!-- Margin Amount -->
        <template #marginAmount="{ record }">
          <a-input-number
            v-model:value="record.marginAmount"
            :min="0"
            :step="0.01"
            :precision="2"
            style="width: 100%"
            @change="updatePriceFromMarginAmount(record)"
          />
        </template>

        <!-- Margin Currency -->
        <template #marginCurrency="{ record }">
          <a-select v-model:value="record.marginCurrency" style="width: 80px">
            <a-select-option value="PLN">PLN</a-select-option>
            <a-select-option value="USD">USD</a-select-option>
            <a-select-option value="EUR">EUR</a-select-option>
          </a-select>
        </template>

        <!-- Total Margin -->
        <template #totalMargin="{ record }">
          {{ formatCurrency(calculateProductMargin(record), 'PLN') }}
        </template>

        <!-- Actions -->
        <template #actionMargin="{ record }">
          <a-button
            type="text"
            danger
            @click="removeProduct(record.id)"
          >
            <DeleteOutlined />
          </a-button>
        </template>
      </a-table>

      <!-- Summary for margin view -->
      <div class="summary-footer">
        <div class="summary-row">
          <span>{{ $t('pricing.totalAmount') }}:</span>
          <strong>{{ formatCurrency(calculateTotal(), 'PLN') }}</strong>
        </div>
        <div class="summary-row">
          <span>{{ $t('pricing.totalMargin') }}:</span>
          <strong>{{ formatCurrency(calculateMargin(), 'PLN') }}</strong>
        </div>
        <a-button type="primary" size="large" style="margin-top: 16px; float: right">
          {{ $t('pricing.save') }}
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Product {
  id: number
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
  packaging: number
  marginPercent: number
  marginAmount: number
  marginCurrency: string
}

// Exchange rates
const exchangeRates = reactive({
  usdToPln: 4.00,
  eurToPln: 4.30,
  eurToUsd: 1.08
})

// Products data
const products = ref<Product[]>([
  {
    id: 1,
    name: 'Pink Paradise Slippers',
    quantity: 1,
    salePrice: 355,
    saleCurrency: 'PLN',
    purchasePrice: 0,
    purchaseCurrency: 'PLN',
    transportCost: 0,
    transportCurrency: 'PLN',
    packagingCost: 0,
    packagingCurrency: 'PLN',
    packaging: 0,
    marginPercent: 0,
    marginAmount: 0,
    marginCurrency: 'PLN'
  }
])

// Table columns
const columns = [
  {
    title: t('pricing.product'),
    key: 'product',
    slots: { customRender: 'product' },
    width: 200
  },
  {
    title: t('pricing.quantity'),
    key: 'quantity',
    slots: { customRender: 'quantity' },
    width: 100
  },
  {
    title: t('pricing.salePrice'),
    key: 'salePrice',
    slots: { customRender: 'salePrice' },
    width: 120
  },
  {
    title: '',
    key: 'saleCurrency',
    slots: { customRender: 'saleCurrency' },
    width: 80
  },
  {
    title: t('pricing.purchasePrice'),
    key: 'purchasePrice',
    slots: { customRender: 'purchasePrice' },
    width: 120
  },
  {
    title: '',
    key: 'purchaseCurrency',
    slots: { customRender: 'purchaseCurrency' },
    width: 80
  },
  {
    title: t('pricing.transportCost'),
    key: 'transportCost',
    slots: { customRender: 'transportCost' },
    width: 120
  },
  {
    title: '',
    key: 'transportCurrency',
    slots: { customRender: 'transportCurrency' },
    width: 80
  },
  {
    title: t('pricing.packagingCost'),
    key: 'packagingCost',
    slots: { customRender: 'packagingCost' },
    width: 120
  },
  {
    title: '',
    key: 'packagingCurrency',
    slots: { customRender: 'packagingCurrency' },
    width: 80
  },
  {
    title: t('pricing.action'),
    key: 'action',
    slots: { customRender: 'action' },
    width: 60,
    fixed: 'right'
  }
]

// Margin table columns
const marginColumns = [
  {
    title: t('pricing.product'),
    key: 'productDisplay',
    slots: { customRender: 'productDisplay' },
    width: 200
  },
  {
    title: t('pricing.packaging'),
    key: 'packaging',
    slots: { customRender: 'packaging' },
    width: 120
  },
  {
    title: t('pricing.purchasePrice'),
    key: 'purchasePriceDisplay',
    slots: { customRender: 'purchasePriceDisplay' },
    width: 150
  },
  {
    title: t('pricing.marginPercent'),
    key: 'marginPercent',
    slots: { customRender: 'marginPercent' },
    width: 120
  },
  {
    title: t('pricing.margin'),
    key: 'marginAmount',
    slots: { customRender: 'marginAmount' },
    width: 120
  },
  {
    title: '',
    key: 'marginCurrency',
    slots: { customRender: 'marginCurrency' },
    width: 80
  },
  {
    title: t('pricing.totalMargin'),
    key: 'totalMargin',
    slots: { customRender: 'totalMargin' },
    width: 150
  },
  {
    title: t('pricing.action'),
    key: 'actionMargin',
    slots: { customRender: 'actionMargin' },
    width: 60,
    fixed: 'right'
  }
]

// Helper functions
const convertToPLN = (amount: number, currency: string): number => {
  if (currency === 'PLN') return amount
  if (currency === 'USD') return amount * exchangeRates.usdToPln
  if (currency === 'EUR') return amount * exchangeRates.eurToPln
  return amount
}

const formatCurrency = (amount: number, currency: string): string => {
  return `${amount.toFixed(2)} ${currency}`
}

const calculateProductMargin = (product: Product): number => {
  const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency)
  const purchasePricePLN = convertToPLN(product.purchasePrice, product.purchaseCurrency)
  const transportCostPLN = convertToPLN(product.transportCost, product.transportCurrency)
  const packagingCostPLN = convertToPLN(product.packagingCost, product.packagingCurrency)
  
  const totalCost = purchasePricePLN + transportCostPLN + packagingCostPLN
  return (salePricePLN - totalCost) * product.quantity
}

const calculateTotal = (): number => {
  return products.value.reduce((sum, product) => {
    return sum + convertToPLN(product.salePrice * product.quantity, product.saleCurrency)
  }, 0)
}

const calculateMargin = (): number => {
  return products.value.reduce((sum, product) => {
    return sum + calculateProductMargin(product)
  }, 0)
}

const addProduct = () => {
  const newId = Math.max(...products.value.map(p => p.id), 0) + 1
  products.value.push({
    id: newId,
    name: '',
    quantity: 1,
    salePrice: 0,
    saleCurrency: 'PLN',
    purchasePrice: 0,
    purchaseCurrency: 'PLN',
    transportCost: 0,
    transportCurrency: 'PLN',
    packagingCost: 0,
    packagingCurrency: 'PLN',
    packaging: 0,
    marginPercent: 0,
    marginAmount: 0,
    marginCurrency: 'PLN'
  })
}

const removeProduct = (id: number) => {
  const index = products.value.findIndex(p => p.id === id)
  if (index > -1) {
    products.value.splice(index, 1)
  }
}

const updatePriceFromMargin = (product: Product) => {
  const purchasePricePLN = convertToPLN(product.purchasePrice, product.purchaseCurrency)
  const marginAmount = purchasePricePLN * (product.marginPercent / 100)
  product.marginAmount = marginAmount
  product.salePrice = purchasePricePLN + marginAmount
  product.saleCurrency = 'PLN'
}

const updatePriceFromMarginAmount = (product: Product) => {
  const purchasePricePLN = convertToPLN(product.purchasePrice, product.purchaseCurrency)
  const marginAmountPLN = convertToPLN(product.marginAmount, product.marginCurrency)
  product.marginPercent = purchasePricePLN > 0 ? (marginAmountPLN / purchasePricePLN) * 100 : 0
  product.salePrice = purchasePricePLN + marginAmountPLN
  product.saleCurrency = 'PLN'
}

const saveCalculation = () => {
  message.success(t('pricing.saveSuccess'))
  // Here you would integrate with Bitrix24 API to save the data
}
</script>

<style scoped>
.pricing-calculator {
  padding: 24px;
}

.mb-4 {
  margin-bottom: 24px;
}

.currency-label {
  font-weight: 500;
  min-width: 80px;
  display: inline-block;
}

.pricing-table :deep(.ant-table) {
  overflow-x: auto;
}

.summary-section {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

:global(.dark) .summary-section {
  background: rgba(255, 255, 255, 0.04);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-label {
  font-weight: 500;
}

.summary-value {
  font-weight: 600;
  color: #1890ff;
}

.summary-footer {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

:global(.dark) .summary-footer {
  background: rgba(255, 255, 255, 0.04);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 16px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pricing-calculator {
    padding: 16px;
  }
  
  .currency-label {
    min-width: auto;
    display: block;
    margin-bottom: 4px;
  }
  
  .pricing-table :deep(.ant-table) {
    font-size: 12px;
  }
}
</style>