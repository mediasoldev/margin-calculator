<!-- frontend/src/components/pages/PricingCalculatorComponent.vue -->

<template>
  <div class="pricing-calculator">
    <!-- Currency Exchange Rates Bar -->
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

    <!-- Toolbar -->
    <a-card class="toolbar-card compact">
      <div class="toolbar-inline">
        <a-space size="small">
          <span class="toolbar-label">{{ $t("pricing.viewMode") }}:</span>
          <a-radio-group
            v-model:value="viewMode"
            button-style="solid"
            size="small"
          >
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
          <a-button
            size="small"
            @click="handleLoadFromBitrix"
            :loading="loading"
          >
            <SyncOutlined /> {{ $t("pricing.loadFromBitrix") }}
          </a-button>
          <a-button size="small" @click="handleRefresh" :loading="loading">
            <ReloadOutlined /> {{ $t("pricing.refresh") }}
          </a-button>
        </a-space>
      </div>
    </a-card>

    <!-- View Mode Content -->
    <a-card class="content-card">
      <!-- Comparison Status Alert -->
      <div v-if="columnsReady" class="comparison-status-inline">
        <a-alert
          v-if="comparisonStatus === 'matches'"
          :message="$t('pricing.savedMatchesDeal')"
          type="success"
          show-icon
          closable
          banner
        />
        <a-alert
          v-else-if="comparisonStatus === 'differs'"
          :message="$t('pricing.savedDiffersFromDeal')"
          type="warning"
          show-icon
          closable
          banner
        />
        <a-alert
          v-else-if="comparisonStatus === 'not_saved'"
          :message="$t('pricing.notCalculatedYet')"
          type="info"
          show-icon
          closable
          banner
        />
      </div>

      <div v-if="!columnsReady" style="padding: 40px; text-align: center">
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
import { usePricingData } from "@/composables/usePricingData";
import { message } from "ant-design-vue";
import {
  TableOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons-vue";

// Components
import PricingTable from "@/components/pricing/table/PricingTable.vue";
import PricingCards from "@/components/pricing/cards/PricingCards.vue";
import PricingAccordion from "@/components/pricing/accordion/PricingAccordion.vue";
import ColumnSettingsModal from "@/components/pricing/ColumnSettingsModal.vue";

// Types & Composables
import type { ExchangeRates, ViewMode } from "@/types/pricing.types";
import { usePricingCalculations } from "@/composables/usePricingCalculations";
import { useCurrencyConversion } from "@/composables/useCurrencyConversion";
import { useColumnManagement } from "@/composables/useColumnManagement";

const { t } = useI18n();

// State
const loading = ref(false);
const saving = ref(false);
const viewMode = ref<ViewMode>("table");
const columnSettingsVisible = ref(false);
const columnsReady = ref(false);

// Exchange rates
const exchangeRates = ref<ExchangeRates>({
  usdToPln: 4.0,
  eurToPln: 4.3,
  eurToUsd: 1.08,
});

// Data loading
const {
  products,
  suppliers,
  loading: dataLoading,
  error: dataError,
  productFields,
  dealCurrency,
  comparisonStatus,
  supplierPricesMap,
  initialize,
  loadDealData,
  saveCalculation: saveData,
  resetToOriginal,
  hasUnsavedChanges,
  addSupplierForProduct,
  updateSupplierPrice,
  getSuppliersForProduct,
} = usePricingData();

// Calculations
const {
  calculateProductValues,
  recalculateFromMarginPercent,
  recalculateFromTotalMargin,
  recalculateFromMarginPerUnit,
  recalculateAll,
  totals: calculatedTotals,
} = usePricingCalculations(products, exchangeRates);

// Currency
const { formatCurrency, getMarginColor } = useCurrencyConversion(exchangeRates);

// âœ… SIMPLIFIED: Column management without dynamic loading
const {
  allColumns,
  visibleColumns,
  initializeColumns,
  saveColumnsConfig,
  isReadOnlyColumn,
} = useColumnManagement();

// Provide context to child components
provide("pricingContext", {
  products,
  exchangeRates,
  totals: calculatedTotals,
  suppliers,
  viewMode,
  loading,
  saving,
  columnsReady,
  allColumns,
  visibleColumns,
  supplierPricesMap,
  calculateProductValues,
  recalculateFromMarginPercent,
  recalculateFromTotalMargin,
  recalculateFromMarginPerUnit,
  recalculateAll,
  formatCurrency,
  getMarginColor,
  isReadOnlyColumn,
  addSupplierForProduct,
  updateSupplierPrice,
  getSuppliersForProduct,
});

// Handlers
const handleRatesChange = async () => {
  recalculateAll();

  // Ð—Ð±ÐµÑ€Ñ–Ð³Ð°Ñ”Ð¼Ð¾ Ð² Ð‘Ñ–Ñ‚Ñ€Ñ–ÐºÑ24
  try {
    await saveExchangeRatesToBitrix();
  } catch (error) {
    console.error("Failed to save exchange rates:", error);
  }
};

// Ð¤ÑƒÐ½ÐºÑ†Ñ–Ñ Ð´Ð»Ñ Ð·Ð±ÐµÑ€ÐµÐ¶ÐµÐ½Ð½Ñ exchangeRates Ð² Ð‘Ñ–Ñ‚Ñ€Ñ–ÐºÑ24
const saveExchangeRatesToBitrix = async () => {
  if (!window.BX24) {
    console.warn("BX24 not available");
    return;
  }

  try {
    const ratesData = JSON.stringify(exchangeRates.value);

    await new Promise<void>((resolve, reject) => {
      window.BX24.appOption.set("exchangeRates", ratesData, (result: any) => {
        if (result) {
          resolve();
        } else {
          reject(new Error("Failed to save exchange rates"));
        }
      });
    });
  } catch (error) {
    console.error("[Bitrix] Error saving exchange rates:", error);
    throw error;
  }
};

// Ð¤ÑƒÐ½ÐºÑ†Ñ–Ñ Ð´Ð»Ñ Ð·Ð°Ð²Ð°Ð½Ñ‚Ð°Ð¶ÐµÐ½Ð½Ñ exchangeRates Ð· Ð‘Ñ–Ñ‚Ñ€Ñ–ÐºÑ24
const loadExchangeRatesFromBitrix = async () => {
  if (!window.BX24) {
    console.warn("BX24 not available");
    return;
  }

  try {
    const result = await new Promise<any>((resolve) => {
      resolve(window.BX24.appOption.get("exchangeRates"));
    });

    if (result && typeof result === "string") {
      const savedRates = JSON.parse(result);
      exchangeRates.value = {
        usdToPln: savedRates.usdToPln || 4.0,
        eurToPln: savedRates.eurToPln || 4.3,
        eurToUsd: savedRates.eurToUsd || 1.08,
      };
    }
  } catch (error) {
    console.error("[Bitrix] Error loading exchange rates:", error);
  }
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

const handleLoadFromBitrix = async () => {
  loading.value = true;
  try {
    await resetToOriginal();
    recalculateAll();
    message.success(t("pricing.loadedFromBitrix"));
  } catch (error) {
    message.error(t("pricing.loadError"));
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async () => {
  loading.value = true;
  try {
    await initialize();
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
    await saveData(exchangeRates.value, calculatedTotals.value);
    message.success(t("pricing.saveSuccess"));
  } catch (error) {
    message.error(t("pricing.saveError"));
  } finally {
    saving.value = false;
  }
};

// âœ… SIMPLIFIED: Lifecycle without dynamic column loading
onMounted(async () => {
  try {
    // Step 0: Load exchange rates from Bitrix24
    await loadExchangeRatesFromBitrix();

    // Step 1: Initialize columns (all predefined)
    initializeColumns();
    columnsReady.value = true;

    // Step 2: Load deal data
    await initialize();

    // Step 3: Calculate
    recalculateAll();
  } catch (err) {
    console.error("[PricingCalculator] Initialization error:", err);
    message.error(t("pricing.loadError"));
  }
});
</script>

<style scoped>
.pricing-calculator {
  padding: 12px;
}

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

.comparison-status-inline {
  margin-bottom: 16px;
}

.comparison-status-inline :deep(.ant-alert) {
  padding: 8px 15px;
  font-size: 13px;
}

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

[data-theme="dark"] .summary-label {
  color: rgba(255, 255, 255, 0.65);
}

.currency-card.compact {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .currency-card.compact {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

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