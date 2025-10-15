<!-- frontend/src/components/pricing/table/PricingTable.vue -->

<template>
  <div class="pricing-table-wrapper">
    <a-table
      :columns="tableColumns"
      :data-source="context.products.value"
      :pagination="false"
      :scroll="{ x: 1800 }"
      row-key="id"
      class="pricing-table"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- Product column with inline edit -->
        <template v-if="column.key === 'product'">
          <div class="product-cell">
            <a-input
              v-if="editingProductId === record.id"
              v-model:value="record.name"
              @blur="stopEditingProduct"
              @pressEnter="stopEditingProduct"
              ref="productNameInput"
              size="small"
              class="product-name-input"
            />
            <span v-else class="product-name">{{ record.name }}</span>
            <a-button 
              type="link" 
              size="small" 
              @click="startEditingProduct(record)"
              class="edit-btn"
            >
              <EditOutlined />
            </a-button>
          </div>
        </template>

        <!-- Quantity column -->
        <template v-else-if="column.key === 'quantity'">
          <a-input-number
            v-model:value="record.quantity"
            :min="0"
            style="width: 100%"
            size="small"
            @change="context.calculateProductValues(record)"
          />
        </template>

        <!-- Sale Price column -->
        <template v-else-if="column.key === 'salePrice'">
          <div class="price-input-group">
            <a-input-number
              v-model:value="record.salePrice"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 110px"
              size="small"
              @change="context.calculateProductValues(record)"
            />
            <a-select
              v-model:value="record.saleCurrency"
              style="width: 65px"
              size="small"
              @change="context.calculateProductValues(record)"
            >
              <a-select-option value="PLN">PLN</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
            </a-select>
          </div>
        </template>

        <!-- Purchase Price column -->
        <template v-else-if="column.key === 'purchasePrice'">
          <div class="price-input-group">
            <a-input-number
              v-model:value="record.purchasePrice"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 110px"
              size="small"
              @change="context.calculateProductValues(record)"
            />
            <a-select
              v-model:value="record.purchaseCurrency"
              style="width: 65px"
              size="small"
              @change="context.calculateProductValues(record)"
            >
              <a-select-option value="PLN">PLN</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
            </a-select>
          </div>
        </template>

        <!-- Total Margin column (editable) -->
        <template v-else-if="column.key === 'totalMargin'">
          <a-input-number
            v-model:value="record._totalMarginInput"
            :step="0.01"
            :precision="2"
            style="width: 100%"
            size="small"
            @change="context.recalculateFromTotalMargin(record)"
          >
            <template #addonAfter>
              <span :style="{ color: context.getMarginColor(record._totalMarginInput || 0) }">
                PLN
              </span>
            </template>
          </a-input-number>
        </template>

        <!-- Supplier column -->
        <template v-else-if="column.key === 'supplier'">
          <a-select
            v-model:value="record.supplierId"
            style="width: 100%"
            size="small"
            :placeholder="$t('pricing.selectSupplier')"
            @change="(value: any) => onSupplierChange(record, value)"
          >
            <a-select-option
              v-for="supplier in context.suppliers.value"
              :key="supplier.id"
              :value="supplier.id"
            >
              {{ supplier.name }}
            </a-select-option>
          </a-select>
        </template>

        <!-- Transport Cost column -->
        <template v-else-if="column.key === 'transportCost'">
          <div class="price-input-group">
            <a-input-number
              v-model:value="record.transportCost"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 110px"
              size="small"
              @change="context.calculateProductValues(record)"
            />
            <a-select
              v-model:value="record.transportCurrency"
              style="width: 65px"
              size="small"
              @change="context.calculateProductValues(record)"
            >
              <a-select-option value="PLN">PLN</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
            </a-select>
          </div>
        </template>

        <!-- Packaging Cost column -->
        <template v-else-if="column.key === 'packagingCost'">
          <div class="price-input-group">
            <a-input-number
              v-model:value="record.packagingCost"
              :min="0"
              :step="0.01"
              :precision="2"
              style="width: 110px"
              size="small"
              @change="context.calculateProductValues(record)"
            />
            <a-select
              v-model:value="record.packagingCurrency"
              style="width: 65px"
              size="small"
              @change="context.calculateProductValues(record)"
            >
              <a-select-option value="PLN">PLN</a-select-option>
              <a-select-option value="USD">USD</a-select-option>
              <a-select-option value="EUR">EUR</a-select-option>
            </a-select>
          </div>
        </template>

        <!-- Margin Percent column (editable) -->
        <template v-else-if="column.key === 'marginPercent'">
          <a-input-number
            v-model:value="record._marginPercentInput"
            :min="0"
            :max="100"
            :step="0.1"
            :precision="2"
            suffix="%"
            style="width: 100%"
            size="small"
            @change="context.recalculateFromMarginPercent(record)"
          />
        </template>

        <!-- Margin Per Unit column (editable) -->
        <template v-else-if="column.key === 'marginPerUnit'">
          <a-input-number
            v-model:value="record._marginPerUnitInput"
            :step="0.01"
            :precision="2"
            style="width: 100%"
            size="small"
            @change="context.recalculateFromMarginPerUnit(record)"
          >
            <template #addonAfter>
              <span :style="{ color: context.getMarginColor(record._marginPerUnitInput || 0) }">
                PLN
              </span>
            </template>
          </a-input-number>
        </template>

        <!-- Margin Amount column (read-only) -->
        <template v-else-if="column.key === 'marginAmount'">
          <span :style="{ color: context.getMarginColor(record._marginAmount || 0), fontWeight: '500' }">
            {{ context.formatCurrency(record._marginAmount || 0, 'PLN') }}
          </span>
        </template>

        <!-- Action column -->
        <template v-else-if="column.key === 'action'">
          <a-button type="text" danger size="small" @click="deleteProduct(record)">
            <DeleteOutlined />
          </a-button>
        </template>

        <!-- Dynamic product fields (read-only) -->
        <template v-else-if="context.isDynamicColumn(column.key)">
          <span class="dynamic-field-value">
            {{ record[column.key] || '-' }}
          </span>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, nextTick, toRaw } from 'vue'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { Product } from '@/types/pricing.types'

// Inject context from parent
const context = inject('pricingContext') as any

// Local state
const editingProductId = ref<string | null>(null)
const productNameInput = ref<any>(null)

// Computed table columns
const tableColumns = computed(() => {
  const cols = toRaw(context.visibleColumns?.value || context.visibleColumns || [])
  return cols.map((col: any) => ({
    title: col.title,
    key: col.key,
    dataIndex: col.key,
    width: col.width || 150,
    ellipsis: true,
  }))
})

// Product name editing
const startEditingProduct = (product: Product) => {
  editingProductId.value = product.id
  nextTick(() => {
    productNameInput.value?.focus()
  })
}

const stopEditingProduct = () => {
  editingProductId.value = null
}

// Supplier change
const onSupplierChange = (product: Product, supplierId: string) => {
  console.log('Supplier changed:', supplierId)
  // TODO: Fetch supplier price from storage
}

// Delete product
const deleteProduct = (product: Product) => {
  const index = context.products.value.findIndex((p: Product) => p.id === product.id)
  if (index > -1) {
    context.products.value.splice(index, 1)
  }
}
</script>

<style scoped>
.pricing-table-wrapper {
  width: 100%;
}

.pricing-table {
  font-size: 13px;
}

.pricing-table :deep(.ant-table-thead > tr > th) {
  background: var(--ant-background-color-light);
  font-weight: 600;
  padding: 10px 8px;
  font-size: 13px;
}

[data-theme='dark'] .pricing-table :deep(.ant-table-thead > tr > th) {
  background: rgba(255, 255, 255, 0.04);
}

.pricing-table :deep(.ant-table-tbody > tr > td) {
  padding: 6px 8px;
}

.pricing-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--primary-color-bg);
}

.pricing-table :deep(.ant-table-bordered .ant-table-thead > tr > th),
.pricing-table :deep(.ant-table-bordered .ant-table-tbody > tr > td) {
  border-right: 1px solid var(--ant-border-color);
}

/* Product cell */
.product-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-name {
  flex: 1;
  font-weight: 500;
}

.product-name-input {
  flex: 1;
}

.edit-btn {
  padding: 0 4px;
  min-width: auto;
}

/* Price input groups */
.price-input-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* Dynamic fields */
.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .price-input-group {
    flex-direction: column;
    width: 100%;
  }
}
</style>