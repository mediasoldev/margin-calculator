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

          <div class="card-content">
            <!-- Quantity -->
            <div v-if="isColumnVisible('quantity')" class="field-row">
              <div class="field-label">{{ getColumnTitle('quantity') }}</div>
              <div class="field-value">
                <a-input-number
                  v-model:value="product.quantity"
                  :min="0"
                  size="small"
                  @change="context.calculateProductValues(product)"
                />
              </div>
            </div>

            <!-- Sale Price -->
            <div v-if="isColumnVisible('salePrice')" class="field-row">
              <div class="field-label">{{ getColumnTitle('salePrice') }}</div>
              <div class="field-value field-with-currency">
                <a-input-number
                  v-model:value="product.salePrice"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.saleCurrency"
                  size="small"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </div>
            </div>

            <!-- Purchase Price -->
            <div v-if="isColumnVisible('purchasePrice')" class="field-row">
              <div class="field-label">{{ getColumnTitle('purchasePrice') }}</div>
              <div class="field-value field-with-currency">
                <a-input-number
                  v-model:value="product.purchasePrice"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.purchaseCurrency"
                  size="small"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </div>
            </div>

            <!-- Total Margin -->
            <div v-if="isColumnVisible('totalMargin')" class="field-row">
              <div class="field-label">{{ getColumnTitle('totalMargin') }}</div>
              <div class="field-value">
                <a-input-number
                  v-model:value="product._totalMarginInput"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  @change="context.recalculateFromTotalMargin(product)"
                >
                  <template #addonAfter>
                    <span :style="{ color: context.getMarginColor(product._totalMarginInput || 0) }">
                      PLN
                    </span>
                  </template>
                </a-input-number>
              </div>
            </div>

            <!-- Supplier -->
            <div v-if="isColumnVisible('supplier')" class="field-row">
              <div class="field-label">{{ getColumnTitle('supplier') }}</div>
              <div class="field-value">
                <a-select
                  v-model:value="product.supplierId"
                  size="small"
                  :placeholder="$t('pricing.selectSupplier')"
                  show-search
                  :filter-option="filterSupplierOption"
                  @change="(value: any) => onSupplierChange(product, value)"
                >
                  <template #dropdownRender="{ menuNode }">
                    <v-nodes :vnodes="menuNode" />
                    <a-divider style="margin: 4px 0" />
                    <div
                      style="padding: 4px 8px; cursor: pointer"
                      @mousedown="(e: any) => e.preventDefault()"
                      @click="openAddSupplierModal(product)"
                    >
                      <PlusOutlined /> {{ $t('pricing.addSupplier') }}
                    </div>
                  </template>
                  
                  <a-select-option
                    v-for="supplier in getProductSuppliers(product.productId)"
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
                        @click.stop="openEditSupplierModal(product, supplier)"
                        class="edit-supplier-btn"
                      >
                        <EditOutlined />
                      </a-button>
                    </div>
                  </a-select-option>
                </a-select>
              </div>
            </div>

            <!-- Transport Cost -->
            <div v-if="isColumnVisible('transportCost')" class="field-row">
              <div class="field-label">{{ getColumnTitle('transportCost') }}</div>
              <div class="field-value field-with-currency">
                <a-input-number
                  v-model:value="product.transportCost"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.transportCurrency"
                  size="small"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </div>
            </div>

            <!-- Packaging Cost -->
            <div v-if="isColumnVisible('packagingCost')" class="field-row">
              <div class="field-label">{{ getColumnTitle('packagingCost') }}</div>
              <div class="field-value field-with-currency">
                <a-input-number
                  v-model:value="product.packagingCost"
                  :min="0"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  @change="context.calculateProductValues(product)"
                />
                <a-select
                  v-model:value="product.packagingCurrency"
                  size="small"
                  @change="context.calculateProductValues(product)"
                >
                  <a-select-option value="PLN">PLN</a-select-option>
                  <a-select-option value="USD">USD</a-select-option>
                  <a-select-option value="EUR">EUR</a-select-option>
                </a-select>
              </div>
            </div>

            <!-- Margin Percent -->
            <div v-if="isColumnVisible('marginPercent')" class="field-row">
              <div class="field-label">{{ getColumnTitle('marginPercent') }}</div>
              <div class="field-value">
                <a-input-number
                  v-model:value="product._marginPercentInput"
                  :min="0"
                  :max="100"
                  :step="0.1"
                  :precision="2"
                  suffix="%"
                  size="small"
                  @change="context.recalculateFromMarginPercent(product)"
                />
              </div>
            </div>

            <!-- Margin Per Unit -->
            <div v-if="isColumnVisible('marginPerUnit')" class="field-row">
              <div class="field-label">{{ getColumnTitle('marginPerUnit') }}</div>
              <div class="field-value">
                <a-input-number
                  v-model:value="product._marginPerUnitInput"
                  :step="0.01"
                  :precision="2"
                  size="small"
                  @change="context.recalculateFromMarginPerUnit(product)"
                >
                  <template #addonAfter>
                    <span :style="{ color: context.getMarginColor(product._marginPerUnitInput || 0) }">
                      PLN
                    </span>
                  </template>
                </a-input-number>
              </div>
            </div>

            <!-- Dynamic fields -->
            <template v-for="col in dynamicColumns" :key="col.key">
              <div v-if="isColumnVisible(col.key)" class="field-row">
                <div class="field-label">{{ col.title }}</div>
                <div class="field-value">
                  <span class="dynamic-field-value">
                    {{ formatDynamicValue(product[col.key]) }}
                  </span>
                </div>
              </div>
            </template>
          </div>
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
import { inject, computed, ref, toRaw } from 'vue'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Product } from '@/types/pricing.types'
import AddSupplierModal from '@/components/pricing/AddSupplierModal.vue'

const context = inject('pricingContext') as any

const editModalVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const editingName = ref('')
const supplierModalVisible = ref(false)
const currentProductId = ref<string>('')
const currentProduct = ref<Product | null>(null)
const editingSupplier = ref<any>(null)

const VNodes = (props: { vnodes: any }) => props.vnodes

const visibleProducts = computed(() => context.products.value)

const dynamicColumns = computed(() => {
  const cols = toRaw(context.allColumns?.value || context.allColumns || [])
  return cols.filter((col: any) => col.isDynamic)
})

const getProductSuppliers = (productId: string): any[] => {
  return context.getSuppliersForProduct(productId) || []
}

const filterSupplierOption = (input: string, option: any) => {
  const label = option.label || ''
  return label.toLowerCase().includes(input.toLowerCase())
}

const isColumnVisible = (key: string): boolean => {
  const cols = toRaw(context.visibleColumns?.value || context.visibleColumns || [])
  return cols.some((col: any) => col.key === key)
}

const getColumnTitle = (key: string): string => {
  const cols = toRaw(context.allColumns?.value || context.allColumns || [])
  const column = cols.find((col: any) => col.key === key)
  return column?.title || key
}

const formatDynamicValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

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

const onSupplierChange = async (product: Product, supplierId: string) => {
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

const openAddSupplierModal = (product: Product) => {
  currentProductId.value = product.productId
  currentProduct.value = product
  editingSupplier.value = null
  supplierModalVisible.value = true
}

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
  }
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

.product-card :deep(.ant-card-body) {
  padding: 16px;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.field-value {
  width: 100%;
}

.field-value :deep(.ant-input-number),
.field-value :deep(.ant-select) {
  width: 100%;
}

.field-with-currency {
  display: flex;
  gap: 8px;
}

.field-with-currency :deep(.ant-input-number) {
  flex: 1;
}

.field-with-currency :deep(.ant-select) {
  width: 70px;
  flex-shrink: 0;
}

.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 13px;
  word-break: break-word;
}

.supplier-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.supplier-price {
  font-weight: 600;
  color: var(--primary-color);
  white-space: nowrap;
}

.supplier-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-supplier-btn {
  padding: 0 4px;
  min-width: auto;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .field-with-currency :deep(.ant-select) {
    width: 65px;
  }
}
</style>