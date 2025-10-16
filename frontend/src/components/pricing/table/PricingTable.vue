<!-- frontend/src/components/pricing/table/PricingTable.vue -->

<template>
  <div class="pricing-table-wrapper">
    <a-table
      :columns="tableColumns"
      :data-source="context.products.value"
      :pagination="false"
      :scroll="{ x: 1400 }"
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

        <!-- Supplier column with custom select -->
        <template v-else-if="column.key === 'supplier'">
          <div class="supplier-select-wrapper">
            <a-select
              v-model:value="record.supplierId"
              style="width: 100%"
              size="small"
              :placeholder="$t('pricing.selectSupplier')"
              show-search
              :filter-option="filterSupplierOption"
              @change="(value: any) => onSupplierChange(record, value)"
            >
              <template #dropdownRender="{ menuNode }">
                <v-nodes :vnodes="menuNode" />
                <a-divider style="margin: 4px 0" />
                <div
                  style="padding: 4px 8px; cursor: pointer"
                  @mousedown="(e: any) => e.preventDefault()"
                  @click="openAddSupplierModal(record)"
                >
                  <PlusOutlined /> {{ $t('pricing.addSupplier') }}
                </div>
              </template>
              
              <a-select-option
                v-for="supplier in getProductSuppliers(record.productId)"
                :key="supplier.company_id"
                :value="supplier.company_id"
                :label="`${supplier.price} ${supplier.currency} - ${supplier.company_name}`"
              >
                <div class="supplier-option">
                  <span class="supplier-price">{{ supplier.price }} {{ supplier.currency }}</span>
                  <span class="supplier-name">{{ supplier.company_name }}</span>
                  <a-button
                    type="link"
                    size="small"
                    @click.stop="openEditSupplierModal(record, supplier)"
                    class="edit-supplier-btn"
                  >
                    <EditOutlined />
                  </a-button>
                </div>
              </a-select-option>
            </a-select>
          </div>
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

        <!-- Action column -->
        <template v-else-if="column.key === 'action'">
          <a-button type="text" danger size="small" @click="deleteProduct(record)">
            <DeleteOutlined />
          </a-button>
        </template>

        <!-- ✅ FIX: Dynamic columns (read-only) - render all other fields -->
        <template v-else>
          <span class="dynamic-field-value">
            {{ formatDynamicValue(record[column.key]) }}
          </span>
        </template>
      </template>
    </a-table>

    <!-- Add/Edit Supplier Modal -->
    <AddSupplierModal
      v-model:open="supplierModalVisible"
      :product-id="currentProductId"
      :edit-data="editingSupplier"
      @save="handleSupplierSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, nextTick, watch } from 'vue'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Product } from '@/types/pricing.types'
import AddSupplierModal from '@/components/pricing/AddSupplierModal.vue'

// Inject context from parent
const context = inject('pricingContext') as any

// Local state
const editingProductId = ref<string | null>(null)
const productNameInput = ref<any>(null)
const supplierModalVisible = ref(false)
const currentProductId = ref<string>('')
const currentProduct = ref<Product | null>(null)
const editingSupplier = ref<any>(null)

// Helper component for vnodes rendering
const VNodes = (props: { vnodes: any }) => props.vnodes

// ✅ FIX: Watch for column changes and force re-render
const tableColumns = computed(() => {
  // Force reactivity by accessing both sources
  const allCols = context.allColumns?.value || context.allColumns || []
  const visibleCols = context.visibleColumns?.value || context.visibleColumns || []
  
  console.log('[PricingTable] Recomputing columns:', {
    allCount: allCols.length,
    visibleCount: visibleCols.length
  })
  
  // Sort by order to ensure correct column sequence
  const sortedVisible = [...visibleCols].sort((a: any, b: any) => a.order - b.order)
  
  return sortedVisible.map((col: any) => ({
    title: col.title,
    key: col.key,
    dataIndex: col.key,
    ellipsis: true,
    ...(col.width && { width: col.width }),
  }))
})

// Watch for column configuration changes
watch(
  () => context.allColumns?.value || context.allColumns,
  (newColumns) => {
    console.log('[PricingTable] Columns configuration changed:', newColumns?.length)
  },
  { deep: true }
)

// Get suppliers for product
const getProductSuppliers = (productId: string): any[] => {
  return context.getSuppliersForProduct(productId) || []
}

// Filter supplier options for search
const filterSupplierOption = (input: string, option: any) => {
  const label = option.label || ''
  return label.toLowerCase().includes(input.toLowerCase())
}

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
const onSupplierChange = async (product: Product, supplierId: string) => {
  console.log('[PricingTable] Supplier changed:', supplierId)
  
  const suppliers = getProductSuppliers(product.productId)
  const supplier = suppliers.find(s => s.company_id === supplierId)
  
  if (supplier) {
    product.purchasePrice = supplier.price
    product.purchaseCurrency = supplier.currency
    product.supplierId = supplier.company_id
    product.supplierName = supplier.company_name
    
    context.calculateProductValues(product)
    message.success(`Supplier selected: ${supplier.company_name}`)
  }
}

// Open Add Supplier Modal
const openAddSupplierModal = (product: Product) => {
  currentProductId.value = product.productId
  currentProduct.value = product
  editingSupplier.value = null
  supplierModalVisible.value = true
}

// Open Edit Supplier Modal
const openEditSupplierModal = (product: Product, supplier: any) => {
  currentProductId.value = product.productId
  currentProduct.value = product
  editingSupplier.value = {
    companyId: supplier.company_id,
    companyName: supplier.company_name,
    price: supplier.price,
    currency: supplier.currency
  }
  supplierModalVisible.value = true
}

// Handle Supplier Save
const handleSupplierSave = async (data: any) => {
  try {
    if (editingSupplier.value) {
      await context.updateSupplierPrice(
        currentProductId.value,
        data.companyId,
        data.price,
        data.currency
      )
      message.success('Supplier updated successfully')
    } else {
      await context.addSupplierForProduct(
        currentProductId.value,
        data.companyId,
        data.companyName,
        data.price,
        data.currency
      )
      message.success('Supplier added successfully')
    }
  } catch (error) {
    message.error('Failed to save supplier')
    console.error('[PricingTable] Error saving supplier:', error)
  }
}

// Delete product
const deleteProduct = (product: Product) => {
  const index = context.products.value.findIndex((p: Product) => p.id === product.id)
  if (index > -1) {
    context.products.value.splice(index, 1)
  }
}

// ✅ FIX: Format dynamic field values with better handling
const formatDynamicValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
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

.price-input-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.supplier-select-wrapper {
  width: 100%;
}

.supplier-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.supplier-price {
  font-weight: 600;
  color: var(--primary-color);
  min-width: 80px;
}

.supplier-name {
  flex: 1;
}

.edit-supplier-btn {
  padding: 0 4px;
  min-width: auto;
}

.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 12px;
  word-break: break-word;
}

@media (max-width: 768px) {
  .price-input-group {
    flex-direction: column;
    width: 100%;
  }
}
</style>