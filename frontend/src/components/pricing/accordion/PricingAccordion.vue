<!-- frontend/src/components/pricing/accordion/PricingAccordion.vue -->

<template>
  <div class="pricing-accordion-wrapper">
    <a-collapse 
      v-model:activeKey="activeKeys" 
      :accordion="false"
      class="pricing-accordion"
    >
      <a-collapse-panel
        v-for="product in visibleProducts"
        :key="product.id"
      >
        <template #header>
          <div class="accordion-header">
            <span class="product-name">{{ product.name }}</span>
            <a-tag 
              :color="getMarginTagColor(product._totalMarginInput || 0)"
              class="margin-tag"
            >
              {{ $t('pricing.totalMargin') }}: 
              {{ context.formatCurrency(product._totalMarginInput || 0, 'PLN') }}
            </a-tag>
          </div>
        </template>

        <template #extra>
          <a-space size="small" @click.stop>
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

        <a-form 
          :label-col="{ span: 8 }" 
          :wrapper-col="{ span: 16 }"
          class="accordion-form"
        >
          <a-row :gutter="16">
            <!-- Quantity -->
            <a-col 
              v-if="isColumnVisible('quantity')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('quantity')">
                <a-input-number
                  v-model:value="product.quantity"
                  :min="0"
                  style="width: 100%"
                  @change="context.calculateProductValues(product)"
                />
              </a-form-item>
            </a-col>

            <!-- Sale Price -->
            <a-col 
              v-if="isColumnVisible('salePrice')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('salePrice')">
                <a-space style="width: 100%">
                  <a-input-number
                    v-model:value="product.salePrice"
                    :min="0"
                    :step="0.01"
                    :precision="2"
                    style="flex: 1"
                    @change="context.calculateProductValues(product)"
                  />
                  <a-select
                    v-model:value="product.saleCurrency"
                    style="width: 80px"
                    @change="context.calculateProductValues(product)"
                  >
                    <a-select-option value="PLN">PLN</a-select-option>
                    <a-select-option value="USD">USD</a-select-option>
                    <a-select-option value="EUR">EUR</a-select-option>
                  </a-select>
                </a-space>
              </a-form-item>
            </a-col>

            <!-- Purchase Price -->
            <a-col 
              v-if="isColumnVisible('purchasePrice')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('purchasePrice')">
                <a-space style="width: 100%">
                  <a-input-number
                    v-model:value="product.purchasePrice"
                    :min="0"
                    :step="0.01"
                    :precision="2"
                    style="flex: 1"
                    @change="context.calculateProductValues(product)"
                  />
                  <a-select
                    v-model:value="product.purchaseCurrency"
                    style="width: 80px"
                    @change="context.calculateProductValues(product)"
                  >
                    <a-select-option value="PLN">PLN</a-select-option>
                    <a-select-option value="USD">USD</a-select-option>
                    <a-select-option value="EUR">EUR</a-select-option>
                  </a-select>
                </a-space>
              </a-form-item>
            </a-col>

            <!-- Total Margin (editable) -->
            <a-col 
              v-if="isColumnVisible('totalMargin')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('totalMargin')">
                <a-input-number
                  v-model:value="product._totalMarginInput"
                  :step="0.01"
                  :precision="2"
                  style="width: 100%"
                  @change="context.recalculateFromTotalMargin(product)"
                >
                  <template #addonAfter>
                    <span :style="{ color: context.getMarginColor(product._totalMarginInput || 0) }">
                      PLN
                    </span>
                  </template>
                </a-input-number>
              </a-form-item>
            </a-col>

            <!-- Supplier -->
            <a-col 
              v-if="isColumnVisible('supplier')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('supplier')">
                <a-select
                  v-model:value="product.supplierId"
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
              </a-form-item>
            </a-col>

            <!-- Transport Cost -->
            <a-col 
              v-if="isColumnVisible('transportCost')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('transportCost')">
                <a-space style="width: 100%">
                  <a-input-number
                    v-model:value="product.transportCost"
                    :min="0"
                    :step="0.01"
                    :precision="2"
                    style="flex: 1"
                    @change="context.calculateProductValues(product)"
                  />
                  <a-select
                    v-model:value="product.transportCurrency"
                    style="width: 80px"
                    @change="context.calculateProductValues(product)"
                  >
                    <a-select-option value="PLN">PLN</a-select-option>
                    <a-select-option value="USD">USD</a-select-option>
                    <a-select-option value="EUR">EUR</a-select-option>
                  </a-select>
                </a-space>
              </a-form-item>
            </a-col>

            <!-- Packaging Cost -->
            <a-col 
              v-if="isColumnVisible('packagingCost')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('packagingCost')">
                <a-space style="width: 100%">
                  <a-input-number
                    v-model:value="product.packagingCost"
                    :min="0"
                    :step="0.01"
                    :precision="2"
                    style="flex: 1"
                    @change="context.calculateProductValues(product)"
                  />
                  <a-select
                    v-model:value="product.packagingCurrency"
                    style="width: 80px"
                    @change="context.calculateProductValues(product)"
                  >
                    <a-select-option value="PLN">PLN</a-select-option>
                    <a-select-option value="USD">USD</a-select-option>
                    <a-select-option value="EUR">EUR</a-select-option>
                  </a-select>
                </a-space>
              </a-form-item>
            </a-col>

            <!-- Margin Percent (editable) -->
            <a-col 
              v-if="isColumnVisible('marginPercent')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('marginPercent')">
                <a-input-number
                  v-model:value="product._marginPercentInput"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  :precision="2"
                  suffix="%"
                  style="width: 100%"
                  @change="context.recalculateFromMarginPercent(product)"
                />
              </a-form-item>
            </a-col>

            <!-- Margin Per Unit (editable) -->
            <a-col 
              v-if="isColumnVisible('marginPerUnit')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('marginPerUnit')">
                <a-input-number
                  v-model:value="product._marginPerUnitInput"
                  :step="0.01"
                  :precision="2"
                  style="width: 100%"
                  @change="context.recalculateFromMarginPerUnit(product)"
                >
                  <template #addonAfter>
                    <span :style="{ color: context.getMarginColor(product._marginPerUnitInput || 0) }">
                      PLN
                    </span>
                  </template>
                </a-input-number>
              </a-form-item>
            </a-col>

            <!-- Margin Amount (read-only) -->
            <a-col 
              v-if="isColumnVisible('marginAmount')"
              :xs="24" 
              :md="12"
            >
              <a-form-item :label="getColumnTitle('marginAmount')">
                <div class="margin-display">
                  <span 
                    class="margin-value"
                    :style="{ color: context.getMarginColor(product._marginAmount || 0) }"
                  >
                    {{ context.formatCurrency(product._marginAmount || 0, 'PLN') }}
                  </span>
                </div>
              </a-form-item>
            </a-col>

            <!-- Dynamic fields (read-only) -->
            <template v-for="col in dynamicColumns" :key="col.key">
              <a-col 
                v-if="isColumnVisible(col.key)"
                :xs="24" 
                :md="12"
              >
                <a-form-item :label="col.title">
                  <span class="dynamic-field-value">
                    {{ product[col.key] || '-' }}
                  </span>
                </a-form-item>
              </a-col>
            </template>
          </a-row>
        </a-form>
      </a-collapse-panel>
    </a-collapse>

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
const activeKeys = ref<string[]>([])
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

const getMarginTagColor = (margin: number): string => {
  if (margin > 0) return 'green'
  if (margin < 0) return 'red'
  return 'default'
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
.pricing-accordion-wrapper {
  width: 100%;
}

.pricing-accordion {
  background: transparent;
}

.pricing-accordion :deep(.ant-collapse-item) {
  margin-bottom: 12px;
  border: 1px solid var(--ant-border-color);
  border-radius: 8px;
  background: var(--ant-background-color);
}

[data-theme='dark'] .pricing-accordion :deep(.ant-collapse-item) {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
}

.pricing-accordion :deep(.ant-collapse-header) {
  background: var(--ant-background-color-light);
  border-radius: 8px 8px 0 0;
  padding: 12px 16px;
}

[data-theme='dark'] .pricing-accordion :deep(.ant-collapse-header) {
  background: rgba(255, 255, 255, 0.04);
}

.pricing-accordion :deep(.ant-collapse-content-box) {
  padding: 20px;
}

.accordion-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.product-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-color);
}

.margin-tag {
  font-weight: 500;
}

.accordion-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.accordion-form :deep(.ant-form-item-label) {
  font-weight: 500;
  font-size: 13px;
}

.margin-display {
  padding: 4px 11px;
  border: 1px solid var(--ant-border-color);
  border-radius: 6px;
  background: var(--ant-background-color-light);
}

[data-theme='dark'] .margin-display {
  background: rgba(255, 255, 255, 0.04);
}

.margin-value {
  font-weight: 600;
  font-size: 14px;
}

.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .accordion-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .accordion-form :deep(.ant-form-item-label) {
    text-align: left;
  }
}
</style>