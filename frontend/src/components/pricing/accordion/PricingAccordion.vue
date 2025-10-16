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
            <template v-for="col in sortedVisibleColumns" :key="col.key">
              <template v-if="col.key !== 'product' && col.key !== 'action'">

                <a-col v-if="col.key === 'quantity'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
                    <a-input-number
                      v-model:value="product.quantity"
                      :min="0"
                      style="width: 100%"
                      @change="context.calculateProductValues(product)"
                    />
                  </a-form-item>
                </a-col>

                <a-col v-else-if="col.key === 'salePrice'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else-if="col.key === 'purchasePrice'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else-if="col.key === 'totalMargin'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else-if="col.key === 'supplier'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
                    <a-select
                      v-model:value="product.supplierId"
                      style="width: 100%"
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
                  </a-form-item>
                </a-col>

                <a-col v-else-if="col.key === 'transportCost'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else-if="col.key === 'packagingCost'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else-if="col.key === 'marginPercent'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else-if="col.key === 'marginPerUnit'" :xs="24" :md="12">
                  <a-form-item :label="col.title">
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

                <a-col v-else :xs="24" :md="12">
                  <a-form-item :label="col.title">
                    <span class="dynamic-field-value">
                      {{ formatDynamicValue(product[col.key]) }}
                    </span>
                  </a-form-item>
                </a-col>

              </template>
            </template>
          </a-row>
        </a-form>
      </a-collapse-panel>
    </a-collapse>

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

const activeKeys = ref<string[]>([])
const editModalVisible = ref(false)
const editingProduct = ref<Product | null>(null)
const editingName = ref('')
const supplierModalVisible = ref(false)
const currentProductId = ref<string>('')
const currentProduct = ref<Product | null>(null)
const editingSupplier = ref<any>(null)

const VNodes = (props: { vnodes: any }) => props.vnodes

const visibleProducts = computed(() => context.products.value)

const sortedVisibleColumns = computed(() => {
  const cols = toRaw(context.visibleColumns?.value || context.visibleColumns || [])
  return [...cols].sort((a: any, b: any) => a.order - b.order)
})

const getProductSuppliers = (productId: string): any[] => {
  return context.getSuppliersForProduct(productId) || []
}

const filterSupplierOption = (input: string, option: any) => {
  const label = option.label || ''
  return label.toLowerCase().includes(input.toLowerCase())
}

const getMarginTagColor = (margin: number): string => {
  if (margin > 0) return 'green'
  if (margin < 0) return 'red'
  return 'default'
}

const formatDynamicValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
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
  console.log('[PricingAccordion] Supplier changed:', supplierId)
  
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
    console.error('[PricingAccordion] Error saving supplier:', error)
  }
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

.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 13px;
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