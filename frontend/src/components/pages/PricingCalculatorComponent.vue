<!-- frontend/src/components/pages/PricingCalculatorComponent.vue -->

<template>
  <div class="pricing-calculator">
    <!-- Currency Exchange Rates Bar - Compact -->
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
            @change="handleRatesChange"
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
            @change="handleRatesChange"
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
            @change="handleRatesChange"
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

    <!-- View Mode Content -->
    <a-card class="content-card">
      <div v-if="!columnsReady" style="padding: 40px; text-align: center;">
        <a-spin size="large" />
      </div>
      
      <template v-else>
        <!-- Table View -->
        <PricingTable v-if="viewMode === 'table'" />

        <!-- Cards View -->
        <PricingCards v-else-if="viewMode === 'cards'" />

        <!-- Accordion View -->
        <PricingAccordion v-else-if="viewMode === 'accordion'" />
      </template>
    </a-card>

    <!-- Summary Footer -->
    <a-card class="summary-card">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="8">
          <div class="summary-item">
            <span class="summary-label">{{ $t("pricing.totalAmount") }}:</span>
            <span class="summary-value">
              {{ formatCurrency(calculatedTotals.amount, "PLN") }}
            </span>
          </div>
        </a-col>
        <a-col :xs="24" :sm="8">
          <div class="summary-item">
            <span class="summary-label">{{ $t("pricing.totalMargin") }}:</span>
            <span 
              class="summary-value" 
              :style="{ color: getMarginColor(calculatedTotals.margin) }"
            >
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
import { ref, provide, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import {
  TableOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";

// Components
import PricingTable from "@/components/pricing/table/PricingTable.vue";
import PricingCards from "@/components/pricing/cards/PricingCards.vue";
import PricingAccordion from "@/components/pricing/accordion/PricingAccordion.vue";
import ColumnSettingsModal from "@/components/pricing/ColumnSettingsModal.vue";

// Types & Composables
import type { Product, Supplier, ExchangeRates, ViewMode } from "@/types/pricing.types";
import { usePricingCalculations } from "@/composables/usePricingCalculations";
import { useCurrencyConversion } from "@/composables/useCurrencyConversion";
import { useColumnManagement } from "@/composables/useColumnManagement";

const { t } = useI18n();

// ============================================================================
// STATE
// ============================================================================

const loading = ref(false);
const saving = ref(false);
const viewMode = ref<ViewMode>("table");
const columnSettingsVisible = ref(false);
const columnsReady = ref(false)

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

// ============================================================================
// COMPOSABLES
// ============================================================================

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

// ============================================================================
// PROVIDE CONTEXT TO CHILD COMPONENTS
// ============================================================================

provide("pricingContext", {
  // State (as refs - передаємо сам ref)
  products,
  exchangeRates,
  totals: calculatedTotals,
  suppliers,
  viewMode,
  loading,
  saving,
  columnsReady,
  
  // Columns (передаємо ref напряму)
  allColumns,
  visibleColumns,
  
  // Methods - Calculations
  calculateProductValues,
  recalculateFromMarginPercent,
  recalculateFromTotalMargin,
  recalculateFromMarginPerUnit,
  recalculateAll,
  
  // Methods - Currency
  formatCurrency,
  getMarginColor,
  
  // Methods - Columns
  isDynamicColumn,
});

// ============================================================================
// HANDLERS
// ============================================================================

const handleRatesChange = () => {
  recalculateAll();
};

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
    // TODO: Fetch products from Bitrix24
    await new Promise(resolve => setTimeout(resolve, 500));
    recalculateAll();
    message.success(t("pricing.productsLoaded"));
  } catch (error) {
    message.error(t("pricing.loadError"));
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  saving.value = true;
  try {
    // TODO: Save to Bitrix24
    await new Promise(resolve => setTimeout(resolve, 1000));
    message.success(t("pricing.saveSuccess"));
  } catch (error) {
    message.error(t("pricing.saveError"));
  } finally {
    saving.value = false;
  }
};

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  loadColumnsConfig();
  columnsReady.value = true;
  recalculateAll();
});
</script>

<style scoped>
.pricing-calculator {
  padding: 12px;
}

/* Compact cards */
.currency-card.compact,
.toolbar-card.compact,
.content-card,
.summary-card {
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

/* Summary */
.summary-card :deep(.ant-card-body) {
  padding: 16px;
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

/* Sticky currency bar */
.currency-card.compact {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme='dark'] .currency-card.compact {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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