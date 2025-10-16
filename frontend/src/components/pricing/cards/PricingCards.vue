<!-- frontend/src/components/pricing/cards/PricingCards.vue -->

<template>
  <div class="pricing-cards-wrapper">
    <a-row :gutter="[16, 16]">
      <a-col
        v-for="product in visibleProducts"
        :key="product.id"
        :xs="24"
        :sm="12"
        :lg="8"
        :xl="6"
      >
        <a-card 
          :title="product.name" 
          hoverable
          class="product-card"
        >
          <template #extra>
            <a-space size="small">
              <a-button 
                type="link" 
                size="small" 
                @click="editProduct(product)"
              >
                <EditOutlined />
              </a-button>
              <a-button 
                type="link" 
                danger 
                size="small" 
                @click="deleteProduct(product)"
              >
                <DeleteOutlined />
              </a-button>
            </a-space>
          </template>

          <a-descriptions 
            :column="1" 
            size="small" 
            bordered
            class="card-descriptions"
          >
            <!-- Quantity -->
            <a-descriptions-item 
              v-if="isColumnVisible('quantity')"
              :label="getColumnTitle('quantity')"
            >
              <a-input-number
                v-model:value="product.quantity"
                :min="0"
                size="small"
                style="width: 100%"
                @change="context.calculateProductValues(product)"
              />
            </a-descriptions-item>

            <!-- Sale Price -->
            <a-descriptions-item 
              v-if="isColumnVisible('salePrice')"
              :label="getColumnTitle('salePrice')"
            >
              <a-space size="small" style="width: 100%">
                <a-input-number
                  v-model:value="product.salePrice"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  style="flex: 1"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.saleCurrency"
                  size="small"
                  style="width: 65px"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </a-space>
            </a-descriptions-item>

            <!-- Purchase Price -->
            <a-descriptions-item 
              v-if="isColumnVisible('purchasePrice')"
              :label="getColumnTitle('purchasePrice')"
            >
              <a-space size="small" style="width: 100%">
                <a-input-number
                  v-model:value="product.purchasePrice"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  style="flex: 1"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.purchaseCurrency"
                  size="small"
                  style="width: 65px"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </a-space>
            </a-descriptions-item>

            <!-- Total Margin (editable) -->
            <a-descriptions-item 
              v-if="isColumnVisible('totalMargin')"
              :label="getColumnTitle('totalMargin')"
            >
              <a-input-number
                v-model:value="product._totalMarginInput"
                :step="0.01"
                :precision="2"
                size="small"
                style="width: 100%"
                @change="context.recalculateFromTotalMargin(product)"
              >
                <template #addonAfter>
                  <span :style="{ color: context.getMarginColor(product._totalMarginInput || 0) }">
                    PLN
                  </span>
                </template>
              </a-input-number>
            </a-descriptions-item>

            <!-- Supplier -->
            <a-descriptions-item 
              v-if="isColumnVisible('supplier')"
              :label="getColumnTitle('supplier')"
            >
              <a-select
                v-model:value="product.supplierId"
                size="small"
                style="width: 100%"
                :placeholder="$t('pricing.selectSupplier')"
                @change="(value: any) => onSupplierChange(product, value)"
              >
                <a-select-option
                  v-for="supplier in context.suppliers.value"
                  :key="supplier.id"
                  :value="supplier.id"
                >
                  {{ supplier.name }}
                </a-select-option>
              </a-select>
            </a-descriptions-item>

            <!-- Transport Cost -->
            <a-descriptions-item 
              v-if="isColumnVisible('transportCost')"
              :label="getColumnTitle('transportCost')"
            >
              <a-space size="small" style="width: 100%">
                <a-input-number
                  v-model:value="product.transportCost"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  style="flex: 1"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.transportCurrency"
                  size="small"
                  style="width: 65px"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </a-space>
            </a-descriptions-item>

            <!-- Packaging Cost -->
            <a-descriptions-item 
              v-if="isColumnVisible('packagingCost')"
              :label="getColumnTitle('packagingCost')"
            >
              <a-space size="small" style="width: 100%">
                <a-input-number
                  v-model:value="product.packagingCost"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  style="flex: 1"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.packagingCurrency"
                  size="small"
                  style="width: 65px"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </a-space>
            </a-descriptions-item>

            <!-- Margin Percent (editable) -->
            <a-descriptions-item 
              v-if="isColumnVisible('marginPercent')"
              :label="getColumnTitle('marginPercent')"
            >
              <a-input-number
                v-model:value="product._marginPercentInput"
                :min="0"
                :max="100"
                :step="0.1"
                :precision="2"
                suffix="%"
                size="small"
                style="width: 100%"
                @change="context.recalculateFromMarginPercent(product)"
              />
            </a-descriptions-item>

            <!-- Margin Per Unit (editable) -->
            <a-descriptions-item 
              v-if="isColumnVisible('marginPerUnit')"
              :label="getColumnTitle('marginPerUnit')"
            >
              <a-input-number
                v-model:value="product._marginPerUnitInput"
                :step="0.01"
                :precision="2"
                size="small"
                style="width: 100%"
                @change="context.recalculateFromMarginPerUnit(product)"
              >
                <template #addonAfter>
                  <span :style="{ color: context.getMarginColor(product._marginPerUnitInput || 0) }">
                    PLN
                  </span>
                </template>
              </a-input-number>
            </a-descriptions-item>

            <!-- Dynamic fields (read-only) -->
            <template v-for="col in dynamicColumns" :key="col.key">
              <a-descriptions-item 
                v-if="isColumnVisible(col.key)"
                :label="col.title"
              >
                <span class="dynamic-field-value">
                  {{ product[col.key] || '-' }}
                </span>
              </a-descriptions-item>
            </template>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>

    <!-- Edit Product Name Modal -->
    <a-modal
      v-model:open="editModalVisible"
      :title="$t('pricing.edit')"
      @ok="saveEdit"
      @cancel="cancelEdit"
    >
      <a-form layout="vertical">
        <a-form-item :label="$t('pricing.productName')">
          <a-input v-model:value="editingName" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { inject, computed, ref, toRaw } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { Product } from '@/types/pricing.types'

// Inject context from parent
const context = inject('pricingContext') as any

// Local state
const editModalVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const editingName = ref('')

// Computed
const visibleProducts = computed(() => context.products.value)

const dynamicColumns = computed(() => {
  const cols = toRaw(context.allColumns?.value || context.allColumns || [])
  return cols.filter((col: any) => col.isDynamic)
})

// Helper methods
const isColumnVisible = (key: string): boolean => {
  const cols = toRaw(context.visibleColumns?.value || context.visibleColumns || [])
  return cols.some((col: any) => col.key === key)
}

const getColumnTitle = (key: string): string => {
  const cols = toRaw(context.allColumns?.value || context.allColumns || [])
  const column = cols.find((col: any) => col.key === key)
  return column?.title || key
}

// Handlers
const editProduct = (product: Product) => {
  editingProduct.value = product
  editingName.value = product.name
  editModalVisible.value = true
}

const saveEdit = () => {
  if (editingProduct.value) {
    editingProduct.value.name = editingName.value
  }
  editModalVisible.value = false
}

const cancelEdit = () => {
  editModalVisible.value = false
  editingProduct.value = null
}

const deleteProduct = (product: Product) => {
  const index = context.products.value.findIndex((p: Product) => p.id === product.id)
  if (index > -1) {
    context.products.value.splice(index, 1)
  }
}

const onSupplierChange = (product: Product, supplierId: string) => {
  console.log('Supplier changed:', supplierId)
  // TODO: Fetch supplier price from storage
}
</script>

<style scoped>
.pricing-cards-wrapper {
  width: 100%;
}

.product-card {
  height: 100%;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

[data-theme='dark'] .product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.product-card :deep(.ant-card-head) {
  background: var(--ant-background-color-light);
  border-bottom: 2px solid var(--primary-color);
}

[data-theme='dark'] .product-card :deep(.ant-card-head) {
  background: rgba(255, 255, 255, 0.04);
}

.product-card :deep(.ant-card-head-title) {
  font-weight: 600;
  font-size: 15px;
}

.card-descriptions :deep(.ant-descriptions-item-label) {
  font-weight: 500;
  font-size: 12px;
  width: 40%;
}

.card-descriptions :deep(.ant-descriptions-item-content) {
  font-size: 13px;
}

.margin-value {
  font-weight: 600;
  font-size: 14px;
}

.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .card-descriptions :deep(.ant-descriptions-item-label) {
    width: 100%;
  }
}
</style>