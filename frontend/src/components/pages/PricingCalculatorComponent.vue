<!-- frontend/src/components/pages/PricingCalculatorComponent.vue -->

<template>
  <div class="pricing-calculator">
    <!-- Currency Exchange Rates Section - Compact -->
    <a-card class="currency-card compact">
      <div class="currency-rates-inline">
        <span class="rates-label">{{ $t("pricing.currencyInfo") }}:</span>
        <div class="rate-item">
          <span class="rate-name">USD/PLN</span>
          <a-input-number
            v-model:value="exchangeRates.usdToPln"
            :min="0"
            :step="0.01"
            :precision="2"
            size="small"
            style="width: 80px"
            @change="recalculateAll"
          />
        </div>
        <div class="rate-item">
          <span class="rate-name">EUR/PLN</span>
          <a-input-number
            v-model:value="exchangeRates.eurToPln"
            :min="0"
            :step="0.01"
            :precision="2"
            size="small"
            style="width: 80px"
            @change="recalculateAll"
          />
        </div>
        <div class="rate-item">
          <span class="rate-name">EUR/USD</span>
          <a-input-number
            v-model:value="exchangeRates.eurToUsd"
            :min="0"
            :step="0.01"
            :precision="2"
            size="small"
            style="width: 80px"
            @change="recalculateAll"
          />
        </div>
      </div>
    </a-card>

    <!-- Toolbar - Compact -->
    <a-card class="toolbar-card compact">
      <div class="toolbar-inline">
        <a-space size="small">
          <span class="toolbar-label">{{ $t("pricing.viewMode") }}:</span>
          <a-radio-group v-model:value="viewMode" button-style="solid" size="small">
            <a-radio-button value="table">
              <TableOutlined /> {{ $t("pricing.tableView") }}
            </a-radio-button>
            <a-radio-button value="cards">
              <AppstoreOutlined /> {{ $t("pricing.cardsView") }}
            </a-radio-button>
            <a-radio-button value="accordion">
              <MenuUnfoldOutlined /> {{ $t("pricing.accordionView") }}
            </a-radio-button>
          </a-radio-group>
        </a-space>
        <a-space size="small">
          <a-button size="small" @click="openColumnSettings">
            <SettingOutlined /> {{ $t("pricing.columns") }}
          </a-button>
          <a-button size="small" @click="handleRefresh" :loading="loading">
            <ReloadOutlined /> {{ $t("pricing.refresh") }}
          </a-button>
        </a-space>
      </div>
    </a-card>

    <!-- Products Display -->
    <a-card class="products-card">
      <!-- Table View -->
      <div v-if="viewMode === 'table'">
        <a-table
          :columns="tableColumns"
          :data-source="products"
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
                @change="onQuantityChange(record)"
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
                  @change="onSalePriceChange(record)"
                />
                <a-select
                  v-model:value="record.saleCurrency"
                  style="width: 65px"
                  size="small"
                  @change="onSalePriceChange(record)"
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
                  @change="onPurchasePriceChange(record)"
                />
                <a-select
                  v-model:value="record.purchaseCurrency"
                  style="width: 65px"
                  size="small"
                  @change="onPurchasePriceChange(record)"
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
                @change="onTotalMarginChange(record)"
              >
                <template #addonAfter>
                  <span :style="{ color: getMarginColor(record._totalMarginInput || 0) }">
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
                  v-for="supplier in suppliers"
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
                  @change="onCostChange(record)"
                />
                <a-select
                  v-model:value="record.transportCurrency"
                  style="width: 65px"
                  size="small"
                  @change="onCostChange(record)"
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
                  @change="onCostChange(record)"
                />
                <a-select
                  v-model:value="record.packagingCurrency"
                  style="width: 65px"
                  size="small"
                  @change="onCostChange(record)"
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
                @change="onMarginPercentChange(record)"
              />
            </template>

            <!-- Margin Per Unit column (editable) - NEW! -->
            <template v-else-if="column.key === 'marginPerUnit'">
              <a-input-number
                v-model:value="record._marginPerUnitInput"
                :step="0.01"
                :precision="2"
                style="width: 100%"
                size="small"
                @change="onMarginPerUnitChange(record)"
              >
                <template #addonAfter>
                  <span :style="{ color: getMarginColor(record._marginPerUnitInput || 0) }">
                    PLN
                  </span>
                </template>
              </a-input-number>
            </template>

            <!-- Margin Amount column (read-only) -->
            <template v-else-if="column.key === 'marginAmount'">
              <span :style="{ color: getMarginColor(record._marginAmount || 0), fontWeight: '500' }">
                {{ formatCurrency(record._marginAmount || 0, 'PLN') }}
              </span>
            </template>

            <!-- Action column -->
            <template v-else-if="column.key === 'action'">
              <a-button type="text" danger size="small" @click="deleteProduct(record)">
                <DeleteOutlined />
              </a-button>
            </template>

            <!-- Dynamic product fields (read-only) -->
            <template v-else-if="isDynamicColumn(column.key)">
              <span class="dynamic-field-value">
                {{ record[column.key] || '-' }}
              </span>
            </template>
          </template>
        </a-table>

        <!-- Summary Footer -->
        <div class="table-summary">
          <a-row :gutter="16" align="middle">
            <a-col :xs="24" :sm="8">
              <div class="summary-item">
                <span class="summary-label">{{ $t("pricing.totalAmount") }}:</span>
                <span class="summary-value">{{
                  formatCurrency(calculatedTotals.amount, "PLN")
                }}</span>
              </div>
            </a-col>
            <a-col :xs="24" :sm="8">
              <div class="summary-item">
                <span class="summary-label">{{ $t("pricing.totalMargin") }}:</span>
                <span class="summary-value" :style="{ color: getMarginColor(calculatedTotals.margin) }">
                  {{ formatCurrency(calculatedTotals.margin, "PLN") }}
                </span>
              </div>
            </a-col>
            <a-col :xs="24" :sm="8" style="text-align: right">
              <a-button
                type="primary"
                size="large"
                @click="handleSave"
                :loading="saving"
              >
                {{ $t("pricing.save") }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </div>

      <!-- Cards and Accordion views placeholder -->
      <div v-else-if="viewMode === 'cards'" class="placeholder">
        <a-empty :description="$t('pricing.cardsViewComingSoon')" />
      </div>

      <div v-else-if="viewMode === 'accordion'" class="placeholder">
        <a-empty :description="$t('pricing.accordionViewComingSoon')" />
      </div>
    </a-card>

    <!-- Column Settings Modal -->
    <ColumnSettingsModal
      v-model:open="columnSettingsVisible"
      :columns="allColumns"
      @save="handleColumnsSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, provide } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import {
  TableOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons-vue";
import ColumnSettingsModal from "@/components/pricing/ColumnSettingsModal.vue";
import type { Product, Supplier, ExchangeRates, ViewMode } from "@/types/pricing.types";
import { usePricingCalculations } from "@/composables/usePricingCalculations";
import { useCurrencyConversion } from "@/composables/useCurrencyConversion";
import { useColumnManagement } from "@/composables/useColumnManagement";

const { t } = useI18n();

// State
const loading = ref(false);
const saving = ref(false);
const viewMode = ref<ViewMode>("table");
const editingProductId = ref<string | null>(null);
const productNameInput = ref<any>(null);
const columnSettingsVisible = ref(false);

// Exchange rates
const exchangeRates = ref<ExchangeRates>({
  usdToPln: 4.0,
  eurToPln: 4.3,
  eurToUsd: 1.08,
});

// Products
const products = ref<Product[]>([
  {
    id: "1",
    name: "Pink Paradise Slippers",
    quantity: 2,
    salePrice: 400,
    saleCurrency: "PLN",
    purchasePrice: 200,
    purchaseCurrency: "PLN",
    transportCost: 0,
    transportCurrency: "PLN",
    packagingCost: 0,
    packagingCurrency: "PLN",
    PRODUCT_ID: "12345",
    MEASURE_NAME: "pcs",
    DISCOUNT_RATE: "0",
    TAX_RATE: "23",
  },
]);

// Suppliers
const suppliers = ref<Supplier[]>([
  { id: "1", name: "Supplier A" },
  { id: "2", name: "Supplier B" },
  { id: "3", name: "Supplier C" },
]);

// Composables
const {
  calculateProductValues,
  recalculateFromMarginPercent,
  recalculateFromTotalMargin,
  recalculateFromMarginPerUnit,
  recalculateAll,
  totals: calculatedTotals,
} = usePricingCalculations(products, exchangeRates);

const { formatCurrency, getMarginColor } = useCurrencyConversion(exchangeRates);

const {
  allColumns,
  visibleColumns,
  loadColumnsConfig,
  saveColumnsConfig,
  isDynamicColumn,
} = useColumnManagement();

// Computed table columns
const tableColumns = computed(() => {
  return visibleColumns.value.map(col => ({
    title: col.title,
    key: col.key,
    dataIndex: col.key,
    width: col.width || 150,
    ellipsis: true,
  }));
});

// Change handlers
const onQuantityChange = (product: Product) => {
  calculateProductValues(product);
};

const onSalePriceChange = (product: Product) => {
  calculateProductValues(product);
};

const onPurchasePriceChange = (product: Product) => {
  calculateProductValues(product);
};

const onCostChange = (product: Product) => {
  calculateProductValues(product);
};

const onMarginPercentChange = (product: Product) => {
  recalculateFromMarginPercent(product);
};

const onTotalMarginChange = (product: Product) => {
  recalculateFromTotalMargin(product);
};

const onMarginPerUnitChange = (product: Product) => {
  recalculateFromMarginPerUnit(product);
};

// Product name editing
const startEditingProduct = (product: Product) => {
  editingProductId.value = product.id;
  nextTick(() => {
    productNameInput.value?.focus();
  });
};

const stopEditingProduct = () => {
  editingProductId.value = null;
};

// Other handlers
const openColumnSettings = () => {
  columnSettingsVisible.value = true;
};

const handleColumnsSave = (columns: any[]) => {
  try {
    saveColumnsConfig(columns);
    message.success(t("settings.saveSuccess"));
  } catch (error) {
    message.error(t("settings.saveError"));
  }
};

const handleRefresh = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    recalculateAll();
    message.success(t("pricing.productsLoaded"));
  } catch (error) {
    message.error(t("pricing.loadError"));
  } finally {
    loading.value = false;
  }
};

const onSupplierChange = async (product: Product, supplierId: string) => {
  console.log("Supplier changed:", supplierId);
  // TODO: Fetch supplier price from storage
};

const handleSave = async () => {
  saving.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    message.success(t("pricing.saveSuccess"));
  } catch (error) {
    message.error(t("pricing.saveError"));
  } finally {
    saving.value = false;
  }
};

const deleteProduct = (product: Product) => {
  const index = products.value.findIndex(p => p.id === product.id);
  if (index > -1) {
    products.value.splice(index, 1);
  }
};

// Lifecycle
onMounted(() => {
  loadColumnsConfig();
  recalculateAll();
});

// Provide context for child components (future use)
provide('pricingContext', {
  products,
  exchangeRates,
  totals: calculatedTotals,
  suppliers,
  viewMode,
  loading,
  saving,
});
</script>

<style scoped>
.pricing-calculator {
  padding: 12px;
}

/* Compact cards */
.currency-card.compact,
.toolbar-card.compact {
  margin-bottom: 12px;
}

.currency-card.compact :deep(.ant-card-body),
.toolbar-card.compact :deep(.ant-card-body) {
  padding: 12px 16px;
}

/* Currency rates inline */
.currency-rates-inline {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.rates-label {
  font-weight: 600;
  color: var(--text-color);
}

.rate-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color-secondary);
  min-width: 70px;
}

/* Toolbar inline */
.toolbar-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-label {
  font-weight: 500;
  color: var(--text-color);
}

/* Products card */
.products-card {
  margin-bottom: 16px;
}

/* Table styles */
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

/* Bordered table */
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

/* Summary */
.table-summary {
  padding: 16px;
  background: var(--summary-bg, #f0f0f0);
  border: 1px solid var(--summary-border, #d9d9d9);
  border-radius: 8px;
  margin-top: 16px;
}

[data-theme='dark'] .table-summary {
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: var(--text-color-secondary);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

[data-theme='dark'] .summary-label {
  color: rgba(255, 255, 255, 0.65);
}

/* Placeholder */
.placeholder {
  padding: 60px 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .pricing-calculator {
    padding: 8px;
  }

  .currency-rates-inline,
  .toolbar-inline {
    flex-direction: column;
    align-items: flex-start;
  }

  .price-input-group {
    flex-direction: column;
    width: 100%;
  }

  .summary-item {
    flex-direction: column;
    text-align: center;
    margin-bottom: 8px;
  }
  
  .summary-value {
    font-size: 16px;
  }
}
</style>