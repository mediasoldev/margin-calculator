<!-- frontend/src/components/pages/PricingCalculatorComponent.vue -->

<template>
  <div class="pricing-calculator">
    <!-- Currency Exchange Rates Section -->
    <a-card class="currency-card">
      <template #title>
        <span>{{ $t("pricing.currencyInfo") }}</span>
      </template>
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="8">
          <div class="currency-pair">
            <span class="currency-label">USD / PLN</span>
            <div class="currency-input-group">
              <a-input value="1" disabled class="currency-base" />
              <span class="currency-divider">/</span>
              <a-input-number
                v-model:value="exchangeRates.usdToPln"
                :min="0"
                :step="0.01"
                :precision="2"
                class="currency-rate"
                @change="calculateTotals"
              />
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="currency-pair">
            <span class="currency-label">EUR / PLN</span>
            <div class="currency-input-group">
              <a-input value="1" disabled class="currency-base" />
              <span class="currency-divider">/</span>
              <a-input-number
                v-model:value="exchangeRates.eurToPln"
                :min="0"
                :step="0.01"
                :precision="2"
                class="currency-rate"
                @change="calculateTotals"
              />
            </div>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="currency-pair">
            <span class="currency-label">EUR / USD</span>
            <div class="currency-input-group">
              <a-input value="1" disabled class="currency-base" />
              <span class="currency-divider">/</span>
              <a-input-number
                v-model:value="exchangeRates.eurToUsd"
                :min="0"
                :step="0.01"
                :precision="2"
                class="currency-rate"
                @change="calculateTotals"
              />
            </div>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- Table Controls -->
    <a-card class="controls-card">
      <a-row :gutter="[16, 16]" align="middle">
        <a-col :xs="24" :sm="12">
          <a-space>
            <span>{{ $t("pricing.viewMode") }}:</span>
            <a-radio-group v-model:value="viewMode" button-style="solid">
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
        </a-col>
        <a-col :xs="24" :sm="12" style="text-align: right">
          <a-space>
            <a-button @click="openColumnSettings">
              <SettingOutlined /> {{ $t("pricing.columns") }}
            </a-button>
            <a-button @click="refreshProducts" :loading="loading">
              <ReloadOutlined /> {{ $t("pricing.refresh") }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </a-card>

    <!-- Products Display -->
    <a-card class="products-card">
      <!-- Table View -->
      <div v-if="viewMode === 'table'">
        <a-table
          :columns="visibleColumns"
          :data-source="products"
          :pagination="false"
          :scroll="{ x: 1500 }"
          row-key="id"
          class="pricing-table"
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
                  style="width: 120px"
                  @change="onSalePriceChange(record)"
                />
                <a-select
                  v-model:value="record.saleCurrency"
                  style="width: 70px"
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
                  style="width: 120px"
                  @change="onPurchasePriceChange(record)"
                />
                <a-select
                  v-model:value="record.purchaseCurrency"
                  style="width: 70px"
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
                style="width: 140px"
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
                  style="width: 120px"
                  @change="onCostChange(record)"
                />
                <a-select
                  v-model:value="record.transportCurrency"
                  style="width: 70px"
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
                  style="width: 120px"
                  @change="onCostChange(record)"
                />
                <a-select
                  v-model:value="record.packagingCurrency"
                  style="width: 70px"
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
                style="width: 100px"
                @change="onMarginPercentChange(record)"
              />
            </template>

            <!-- Margin Amount column (read-only) -->
            <template v-else-if="column.key === 'marginAmount'">
              <span :style="{ color: getMarginColor(record._marginAmount || 0), fontWeight: '500' }">
                {{ formatCurrency(record._marginAmount || 0, "PLN") }}
              </span>
            </template>

            <!-- Action column -->
            <template v-else-if="column.key === 'action'">
              <a-button type="text" danger size="small" @click="deleteProduct(record)">
                <DeleteOutlined />
              </a-button>
            </template>

            <!-- Dynamic product fields (read-only) -->
            <template v-else-if="isDynamicField(column.key)">
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
                  formatCurrency(totals.amount, "PLN")
                }}</span>
              </div>
            </a-col>
            <a-col :xs="24" :sm="8">
              <div class="summary-item">
                <span class="summary-label">{{ $t("pricing.totalMargin") }}:</span>
                <span class="summary-value" :style="{ color: getMarginColor(totals.margin) }">
                  {{ formatCurrency(totals.margin, "PLN") }}
                </span>
              </div>
            </a-col>
            <a-col :xs="24" :sm="8" style="text-align: right">
              <a-button
                type="primary"
                size="large"
                @click="saveToDeal"
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
import { ref, reactive, computed, onMounted, nextTick } from "vue";
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

const { t } = useI18n();

// Types
interface Product {
  id: string;
  name: string;
  quantity: number;
  salePrice: number;
  saleCurrency: string;
  purchasePrice: number;
  purchaseCurrency: string;
  transportCost: number;
  transportCurrency: string;
  packagingCost: number;
  packagingCurrency: string;
  supplierId?: string;
  
  // Internal computed fields
  _totalMarginInput?: number;
  _marginPercentInput?: number;
  _marginAmount?: number;
  
  // Dynamic Bitrix24 fields
  [key: string]: any;
}

interface Supplier {
  id: string;
  name: string;
}

interface ColumnConfig {
  key: string;
  title: string;
  required: boolean;
  locked: boolean;
  visible: boolean;
  order: number;
  width?: number;
  isDynamic?: boolean;
}

// State
const loading = ref(false);
const saving = ref(false);
const viewMode = ref<"table" | "cards" | "accordion">("table");
const editingProductId = ref<string | null>(null);
const productNameInput = ref<any>(null);

const products = ref<Product[]>([
  {
    id: "1",
    name: "Pink Paradise Slippers",
    quantity: 1,
    salePrice: 400,
    saleCurrency: "PLN",
    purchasePrice: 200,
    purchaseCurrency: "PLN",
    transportCost: 0,
    transportCurrency: "PLN",
    packagingCost: 0,
    packagingCurrency: "PLN",
    // Mock dynamic fields
    PRODUCT_ID: "12345",
    MEASURE_NAME: "pcs",
    DISCOUNT_RATE: "0",
    TAX_RATE: "23",
  },
]);

const suppliers = ref<Supplier[]>([
  { id: "1", name: "Supplier A" },
  { id: "2", name: "Supplier B" },
  { id: "3", name: "Supplier C" },
]);

const columnSettingsVisible = ref(false);

// Exchange rates
const exchangeRates = reactive({
  usdToPln: 4.0,
  eurToPln: 4.3,
  eurToUsd: 1.08,
});

// Totals
const totals = reactive({
  amount: 0,
  margin: 0,
});

// Column management
const STORAGE_KEY = "pricingColumnsConfig";

const getDefaultColumns = (): ColumnConfig[] => {
  return [
    { key: "product", title: t("pricing.product"), required: true, locked: true, visible: true, order: 1, width: 200 },
    { key: "quantity", title: t("pricing.quantity"), required: true, locked: true, visible: true, order: 2, width: 100 },
    { key: "salePrice", title: t("pricing.salePrice"), required: true, locked: true, visible: true, order: 3, width: 200 },
    { key: "purchasePrice", title: t("pricing.purchasePrice"), required: true, locked: true, visible: true, order: 4, width: 200 },
    { key: "totalMargin", title: t("pricing.totalMargin"), required: true, locked: true, visible: true, order: 5, width: 160 },
    { key: "supplier", title: t("pricing.supplier"), required: false, locked: false, visible: true, order: 6, width: 150 },
    { key: "transportCost", title: t("pricing.transportCost"), required: false, locked: false, visible: true, order: 7, width: 200 },
    { key: "packagingCost", title: t("pricing.packagingCost"), required: false, locked: false, visible: true, order: 8, width: 200 },
    { key: "marginPercent", title: t("pricing.marginPercent"), required: false, locked: false, visible: true, order: 9, width: 120 },
    { key: "marginAmount", title: t("pricing.marginAmount"), required: false, locked: false, visible: true, order: 10, width: 150 },
    { key: "action", title: t("pricing.action"), required: true, locked: true, visible: true, order: 11, width: 80 },
    // Dynamic fields from mock
    { key: "PRODUCT_ID", title: "Product ID", required: false, locked: false, visible: false, order: 100, width: 120, isDynamic: true },
    { key: "MEASURE_NAME", title: "Unit of Measure", required: false, locked: false, visible: false, order: 101, width: 150, isDynamic: true },
    { key: "DISCOUNT_RATE", title: "Discount Rate", required: false, locked: false, visible: false, order: 102, width: 120, isDynamic: true },
    { key: "TAX_RATE", title: "Tax Rate", required: false, locked: false, visible: false, order: 103, width: 100, isDynamic: true },
  ];
};

const allColumns = ref<ColumnConfig[]>(getDefaultColumns());

// Load columns from localStorage
const loadColumnsConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const defaultCols = getDefaultColumns();
      const savedKeys = new Set(parsed.map((c: ColumnConfig) => c.key));
      
      const merged = [...parsed];
      defaultCols.forEach(defCol => {
        if (!savedKeys.has(defCol.key)) {
          merged.push(defCol);
        }
      });
      
      allColumns.value = merged.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error("Error loading columns config:", error);
    allColumns.value = getDefaultColumns();
  }
};

// Save columns to localStorage
const saveColumnsConfig = (columns: ColumnConfig[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    allColumns.value = columns;
    message.success(t("settings.saveSuccess"));
  } catch (error) {
    console.error("Error saving columns config:", error);
    message.error(t("settings.saveError"));
  }
};

// Computed visible columns for table
const visibleColumns = computed(() => {
  return allColumns.value
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order)
    .map((col) => ({
      title: col.title,
      key: col.key,
      dataIndex: col.key,
      width: col.width || 150,
      ellipsis: true,
    }));
});

// Check if field is dynamic
const isDynamicField = (key: string): boolean => {
  return allColumns.value.find(col => col.key === key)?.isDynamic || false;
};

// Currency conversion
const convertToPLN = (amount: number, currency: string): number => {
  if (currency === "PLN") return amount;
  if (currency === "USD") return amount * exchangeRates.usdToPln;
  if (currency === "EUR") return amount * exchangeRates.eurToPln;
  return amount;
};

const formatCurrency = (amount: number, currency: string): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

// Calculate product margin values
const calculateProductValues = (product: Product) => {
  const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency);
  const purchasePricePLN = convertToPLN(product.purchasePrice, product.purchaseCurrency);
  const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency);
  const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency);

  const revenue = salePricePLN * product.quantity;
  const totalCost = (purchasePricePLN * product.quantity) + transportPLN + packagingPLN;
  const totalMargin = revenue - totalCost;
  const marginAmount = totalMargin / product.quantity;
  const marginPercent = revenue > 0 ? (totalMargin / revenue) * 100 : 0;

  product._totalMarginInput = totalMargin;
  product._marginPercentInput = marginPercent;
  product._marginAmount = marginAmount;
};

// Recalculate from margin percent
const recalculateFromMarginPercent = (product: Product) => {
  const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency);
  const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency);
  const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency);
  
  const revenue = salePricePLN * product.quantity;
  const desiredMargin = revenue * ((product._marginPercentInput || 0) / 100);
  const totalCost = revenue - desiredMargin;
  const purchaseCostTotal = totalCost - transportPLN - packagingPLN;
  const purchasePricePerUnit = purchaseCostTotal / product.quantity;
  
  product.purchasePrice = Math.max(0, purchasePricePerUnit);
  product.purchaseCurrency = "PLN";
  product._totalMarginInput = desiredMargin;
  product._marginAmount = desiredMargin / product.quantity;
};

// Recalculate from total margin
const recalculateFromTotalMargin = (product: Product) => {
  const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency);
  const transportPLN = convertToPLN(product.transportCost || 0, product.transportCurrency);
  const packagingPLN = convertToPLN(product.packagingCost || 0, product.packagingCurrency);
  
  const revenue = salePricePLN * product.quantity;
  const desiredMargin = product._totalMarginInput || 0;
  const totalCost = revenue - desiredMargin;
  const purchaseCostTotal = totalCost - transportPLN - packagingPLN;
  const purchasePricePerUnit = purchaseCostTotal / product.quantity;
  
  product.purchasePrice = Math.max(0, purchasePricePerUnit);
  product.purchaseCurrency = "PLN";
  product._marginPercentInput = revenue > 0 ? (desiredMargin / revenue) * 100 : 0;
  product._marginAmount = desiredMargin / product.quantity;
};

// Calculate totals
const calculateTotals = () => {
  products.value.forEach(calculateProductValues);
  
  totals.amount = products.value.reduce((sum, product) => {
    return sum + convertToPLN(product.salePrice * product.quantity, product.saleCurrency);
  }, 0);

  totals.margin = products.value.reduce((sum, product) => {
    return sum + (product._totalMarginInput || 0);
  }, 0);
};

// Get margin color
const getMarginColor = (margin: number): string => {
  if (margin > 0) return "#52c41a";
  if (margin < 0) return "#f5222d";
  return "#8c8c8c";
};

// Change handlers
const onQuantityChange = (product: Product) => {
  calculateProductValues(product);
  calculateTotals();
};

const onSalePriceChange = (product: Product) => {
  calculateProductValues(product);
  calculateTotals();
};

const onPurchasePriceChange = (product: Product) => {
  calculateProductValues(product);
  calculateTotals();
};

const onCostChange = (product: Product) => {
  calculateProductValues(product);
  calculateTotals();
};

const onMarginPercentChange = (product: Product) => {
  recalculateFromMarginPercent(product);
  calculateTotals();
};

const onTotalMarginChange = (product: Product) => {
  recalculateFromTotalMargin(product);
  calculateTotals();
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

const handleColumnsSave = (columns: ColumnConfig[]) => {
  saveColumnsConfig(columns);
};

const refreshProducts = async () => {
  loading.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    products.value.forEach(calculateProductValues);
    calculateTotals();
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

const saveToDeal = async () => {
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
    calculateTotals();
  }
};

// Lifecycle
onMounted(() => {
  loadColumnsConfig();
  products.value.forEach(calculateProductValues);
  calculateTotals();
});
</script>

<style scoped>
.pricing-calculator {
  padding: 16px;
}

.currency-card,
.controls-card,
.products-card {
  margin-bottom: 16px;
}

.currency-pair {
  text-align: center;
}

.currency-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-color);
}

.currency-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.currency-base {
  width: 40px;
  text-align: center;
}

.currency-divider {
  font-size: 18px;
  color: #d9d9d9;
}

[data-theme='dark'] .currency-divider {
  color: rgba(255, 255, 255, 0.3);
}

.currency-rate {
  width: 100px;
}

.price-input-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-name {
  flex: 1;
}

.product-name-input {
  flex: 1;
}

.edit-btn {
  padding: 0 4px;
  min-width: auto;
}

.dynamic-field-value {
  color: var(--text-color-secondary);
  font-size: 13px;
}

.pricing-table :deep(.ant-table) {
  font-size: 13px;
}

.pricing-table :deep(.ant-table-thead > tr > th) {
  background: var(--ant-background-color-light);
  font-weight: 600;
  padding: 12px 8px;
}

[data-theme='dark'] .pricing-table :deep(.ant-table-thead > tr > th) {
  background: rgba(255, 255, 255, 0.04);
}

.pricing-table :deep(.ant-table-tbody > tr > td) {
  padding: 8px;
}

.pricing-table :deep(.ant-table-tbody > tr:hover > td) {
  background: var(--primary-color-bg);
}

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

.placeholder {
  padding: 60px 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .pricing-calculator {
    padding: 8px;
  }

  .currency-input-group {
    flex-direction: column;
    gap: 4px;
  }

  .currency-base,
  .currency-rate {
    width: 100%;
  }

  .price-input-group {
    flex-direction: column;
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