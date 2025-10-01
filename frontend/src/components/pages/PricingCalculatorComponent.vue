<!-- frontend/src/components/pages/PricingCalculatorComponent.vue -->

<template>
  <div class="pricing-calculator">
    <!-- Currency Exchange Rates Section -->
    <a-card class="currency-card">
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
            <a-button @click="showColumnSettings">
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
          <!-- Custom column renders -->
          <template #product="{ record }">
            <a-space>
              <span>{{ record.name }}</span>
              <a-button type="link" size="small" @click="editProduct(record)">
                <EditOutlined />
              </a-button>
            </a-space>
          </template>

          <template #quantity="{ record }">
            <a-input-number
              v-model:value="record.quantity"
              :min="0"
              style="width: 80px"
              @change="calculateTotals"
            />
          </template>

          <template #salePrice="{ record }">
            <div class="price-input-group">
              <a-input-number
                v-model:value="record.salePrice"
                :min="0"
                :step="0.01"
                :precision="2"
                style="width: 120px"
                @change="calculateTotals"
              />
              <a-select
                v-model:value="record.saleCurrency"
                style="width: 70px"
                @change="calculateTotals"
              >
                <a-select-option value="PLN">PLN</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
              </a-select>
            </div>
          </template>

          <template #purchasePrice="{ record }">
            <div class="price-input-group">
              <a-input-number
                v-model:value="record.purchasePrice"
                :min="0"
                :step="0.01"
                :precision="2"
                style="width: 120px"
                @change="calculateTotals"
              />
              <a-select
                v-model:value="record.purchaseCurrency"
                style="width: 70px"
                @change="calculateTotals"
              >
                <a-select-option value="PLN">PLN</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
              </a-select>
            </div>
          </template>

          <template #supplier="{ record }">
            <a-select
              v-model:value="record.supplierId"
              style="width: 150px"
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

          <template #transportCost="{ record }">
            <div class="price-input-group">
              <a-input-number
                v-model:value="record.transportCost"
                :min="0"
                :step="0.01"
                :precision="2"
                style="width: 120px"
                @change="calculateTotals"
              />
              <a-select
                v-model:value="record.transportCurrency"
                style="width: 70px"
                @change="calculateTotals"
              >
                <a-select-option value="PLN">PLN</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
              </a-select>
            </div>
          </template>

          <template #packagingCost="{ record }">
            <div class="price-input-group">
              <a-input-number
                v-model:value="record.packagingCost"
                :min="0"
                :step="0.01"
                :precision="2"
                style="width: 120px"
                @change="calculateTotals"
              />
              <a-select
                v-model:value="record.packagingCurrency"
                style="width: 70px"
                @change="calculateTotals"
              >
                <a-select-option value="PLN">PLN</a-select-option>
                <a-select-option value="USD">USD</a-select-option>
                <a-select-option value="EUR">EUR</a-select-option>
              </a-select>
            </div>
          </template>
        </a-table>

        <!-- Summary Footer -->
        <div class="table-summary">
          <a-row :gutter="16" align="middle">
            <a-col :xs="24" :sm="8">
              <div class="summary-item">
                <span class="summary-label"
                  >{{ $t("pricing.totalAmount") }}:</span
                >
                <span class="summary-value">{{
                  formatCurrency(totals.amount, "PLN")
                }}</span>
              </div>
            </a-col>
            <a-col :xs="24" :sm="8">
              <div class="summary-item">
                <span class="summary-label"
                  >{{ $t("pricing.totalMargin") }}:</span
                >
                <span class="summary-value">{{
                  formatCurrency(totals.margin, "PLN")
                }}</span>
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

      <!-- Cards View -->
      <div v-else-if="viewMode === 'cards'">
        <a-row :gutter="[16, 16]">
          <a-col
            v-for="product in products"
            :key="product.id"
            :xs="24"
            :sm="12"
            :lg="8"
          >
            <a-card :title="product.name" hoverable>
              <a-descriptions :column="1" size="small">
                <!-- Quantity field -->
                <a-descriptions-item
                  v-if="selectedColumns.includes('quantity')"
                  :label="$t('pricing.quantity')"
                >
                  <a-input-number
                    v-model:value="product.quantity"
                    :min="0"
                    size="small"
                    style="width: 100%"
                    @change="calculateTotals"
                  />
                </a-descriptions-item>

                <!-- Sale Price field -->
                <a-descriptions-item
                  v-if="selectedColumns.includes('salePrice')"
                  :label="$t('pricing.salePrice')"
                >
                  <a-space compact>
                    <a-input-number
                      v-model:value="product.salePrice"
                      :min="0"
                      :step="0.01"
                      :precision="2"
                      size="small"
                      style="width: 100px"
                      @change="calculateTotals"
                    />
                    <a-select
                      v-model:value="product.saleCurrency"
                      size="small"
                      style="width: 60px"
                      @change="calculateTotals"
                    >
                      <a-select-option value="PLN">PLN</a-select-option>
                      <a-select-option value="USD">USD</a-select-option>
                      <a-select-option value="EUR">EUR</a-select-option>
                    </a-select>
                  </a-space>
                </a-descriptions-item>

                <!-- Purchase Price field -->
                <a-descriptions-item
                  v-if="selectedColumns.includes('purchasePrice')"
                  :label="$t('pricing.purchasePrice')"
                >
                  <a-space compact>
                    <a-input-number
                      v-model:value="product.purchasePrice"
                      :min="0"
                      :step="0.01"
                      :precision="2"
                      size="small"
                      style="width: 100px"
                      @change="calculateTotals"
                    />
                    <a-select
                      v-model:value="product.purchaseCurrency"
                      size="small"
                      style="width: 60px"
                      @change="calculateTotals"
                    >
                      <a-select-option value="PLN">PLN</a-select-option>
                      <a-select-option value="USD">USD</a-select-option>
                      <a-select-option value="EUR">EUR</a-select-option>
                    </a-select>
                  </a-space>
                </a-descriptions-item>

                <!-- Supplier field -->
                <a-descriptions-item
                  v-if="selectedColumns.includes('supplier')"
                  :label="$t('pricing.supplier')"
                >
                  <a-select
                    v-model:value="product.supplierId"
                    size="small"
                    style="width: 100%"
                    :placeholder="$t('pricing.selectSupplier')"
                    @change="(value: any) => onSupplierChange(product, value)"
                  >
                    <a-select-option
                      v-for="supplier in suppliers"
                      :key="supplier.id"
                      :value="supplier.id"
                    >
                      {{ supplier.name }}
                    </a-select-option>
                  </a-select>
                </a-descriptions-item>

                <!-- Transport Cost field -->
                <a-descriptions-item
                  v-if="selectedColumns.includes('transportCost')"
                  :label="$t('pricing.transportCost')"
                >
                  <a-space compact>
                    <a-input-number
                      v-model:value="product.transportCost"
                      :min="0"
                      :step="0.01"
                      :precision="2"
                      size="small"
                      style="width: 100px"
                      @change="calculateTotals"
                    />
                    <a-select
                      v-model:value="product.transportCurrency"
                      size="small"
                      style="width: 60px"
                      @change="calculateTotals"
                    >
                      <a-select-option value="PLN">PLN</a-select-option>
                      <a-select-option value="USD">USD</a-select-option>
                      <a-select-option value="EUR">EUR</a-select-option>
                    </a-select>
                  </a-space>
                </a-descriptions-item>

                <!-- Packaging Cost field -->
                <a-descriptions-item
                  v-if="selectedColumns.includes('packagingCost')"
                  :label="$t('pricing.packagingCost')"
                >
                  <a-space compact>
                    <a-input-number
                      v-model:value="product.packagingCost"
                      :min="0"
                      :step="0.01"
                      :precision="2"
                      size="small"
                      style="width: 100px"
                      @change="calculateTotals"
                    />
                    <a-select
                      v-model:value="product.packagingCurrency"
                      size="small"
                      style="width: 60px"
                      @change="calculateTotals"
                    >
                      <a-select-option value="PLN">PLN</a-select-option>
                      <a-select-option value="USD">USD</a-select-option>
                      <a-select-option value="EUR">EUR</a-select-option>
                    </a-select>
                  </a-space>
                </a-descriptions-item>

                <!-- Custom fields -->
                <template v-for="col in selectedColumns" :key="col">
                  <a-descriptions-item
                    v-if="
                      ![
                        'product',
                        'quantity',
                        'salePrice',
                        'purchasePrice',
                        'supplier',
                        'transportCost',
                        'packagingCost',
                      ].includes(col)
                    "
                    :label="availableColumns.find((c) => c.key === col)?.title"
                  >
                    <a-input
                      v-if="product[col] !== undefined"
                      v-model:value="product[col]"
                      size="small"
                      @change="calculateTotals"
                    />
                  </a-descriptions-item>
                </template>

                <!-- Margin (always shown) -->
                <a-descriptions-item :label="$t('pricing.margin')">
                  <span
                    :style="{
                      color: getMarginColor(calculateProductMargin(product)),
                      fontWeight: 'bold',
                    }"
                  >
                    {{ formatCurrency(calculateProductMargin(product), "PLN") }}
                  </span>
                </a-descriptions-item>
              </a-descriptions>

              <template #actions>
                <a-button size="small" @click="editProduct(product)">
                  <EditOutlined /> {{ $t("pricing.edit") }}
                </a-button>
              </template>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- Accordion View -->
      <div v-else-if="viewMode === 'accordion'">
        <a-collapse v-model:activeKey="activeKeys" :accordion="false">
          <a-collapse-panel
            v-for="product in products"
            :key="product.id"
            :header="getAccordionHeader(product)"
          >
            <a-form :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
              <a-row :gutter="16">
                <!-- Quantity field -->
                <a-col
                  v-if="selectedColumns.includes('quantity')"
                  :xs="24"
                  :md="12"
                >
                  <a-form-item :label="$t('pricing.quantity')">
                    <a-input-number
                      v-model:value="product.quantity"
                      :min="0"
                      style="width: 100%"
                      @change="calculateTotals"
                    />
                  </a-form-item>
                </a-col>

                <!-- Sale Price field -->
                <a-col
                  v-if="selectedColumns.includes('salePrice')"
                  :xs="24"
                  :md="12"
                >
                  <a-form-item :label="$t('pricing.salePrice')">
                    <a-space>
                      <a-input-number
                        v-model:value="product.salePrice"
                        :min="0"
                        :step="0.01"
                        :precision="2"
                        @change="calculateTotals"
                      />
                      <a-select
                        v-model:value="product.saleCurrency"
                        style="width: 80px"
                        @change="calculateTotals"
                      >
                        <a-select-option value="PLN">PLN</a-select-option>
                        <a-select-option value="USD">USD</a-select-option>
                        <a-select-option value="EUR">EUR</a-select-option>
                      </a-select>
                    </a-space>
                  </a-form-item>
                </a-col>

                <!-- Purchase Price field -->
                <a-col
                  v-if="selectedColumns.includes('purchasePrice')"
                  :xs="24"
                  :md="12"
                >
                  <a-form-item :label="$t('pricing.purchasePrice')">
                    <a-space>
                      <a-input-number
                        v-model:value="product.purchasePrice"
                        :min="0"
                        :step="0.01"
                        :precision="2"
                        @change="calculateTotals"
                      />
                      <a-select
                        v-model:value="product.purchaseCurrency"
                        style="width: 80px"
                        @change="calculateTotals"
                      >
                        <a-select-option value="PLN">PLN</a-select-option>
                        <a-select-option value="USD">USD</a-select-option>
                        <a-select-option value="EUR">EUR</a-select-option>
                      </a-select>
                    </a-space>
                  </a-form-item>
                </a-col>

                <!-- Supplier field -->
                <a-col
                  v-if="selectedColumns.includes('supplier')"
                  :xs="24"
                  :md="12"
                >
                  <a-form-item :label="$t('pricing.supplier')">
                    <a-select
                      v-model:value="product.supplierId"
                      style="width: 100%"
                      :placeholder="$t('pricing.selectSupplier')"
                      @change="(value: any) => onSupplierChange(product, value)"
                    >
                      <a-select-option
                        v-for="supplier in suppliers"
                        :key="supplier.id"
                        :value="supplier.id"
                      >
                        {{ supplier.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>

                <!-- Transport Cost field -->
                <a-col
                  v-if="selectedColumns.includes('transportCost')"
                  :xs="24"
                  :md="12"
                >
                  <a-form-item :label="$t('pricing.transportCost')">
                    <a-space>
                      <a-input-number
                        v-model:value="product.transportCost"
                        :min="0"
                        :step="0.01"
                        :precision="2"
                        @change="calculateTotals"
                      />
                      <a-select
                        v-model:value="product.transportCurrency"
                        style="width: 80px"
                        @change="calculateTotals"
                      >
                        <a-select-option value="PLN">PLN</a-select-option>
                        <a-select-option value="USD">USD</a-select-option>
                        <a-select-option value="EUR">EUR</a-select-option>
                      </a-select>
                    </a-space>
                  </a-form-item>
                </a-col>

                <!-- Packaging Cost field -->
                <a-col
                  v-if="selectedColumns.includes('packagingCost')"
                  :xs="24"
                  :md="12"
                >
                  <a-form-item :label="$t('pricing.packagingCost')">
                    <a-space>
                      <a-input-number
                        v-model:value="product.packagingCost"
                        :min="0"
                        :step="0.01"
                        :precision="2"
                        @change="calculateTotals"
                      />
                      <a-select
                        v-model:value="product.packagingCurrency"
                        style="width: 80px"
                        @change="calculateTotals"
                      >
                        <a-select-option value="PLN">PLN</a-select-option>
                        <a-select-option value="USD">USD</a-select-option>
                        <a-select-option value="EUR">EUR</a-select-option>
                      </a-select>
                    </a-space>
                  </a-form-item>
                </a-col>

                <!-- Custom fields -->
                <template v-for="col in selectedColumns" :key="col">
                  <a-col
                    v-if="
                      ![
                        'product',
                        'quantity',
                        'salePrice',
                        'purchasePrice',
                        'supplier',
                        'transportCost',
                        'packagingCost',
                      ].includes(col)
                    "
                    :xs="24"
                    :md="12"
                  >
                    <a-form-item
                      v-if="availableColumns.find((c) => c.key === col)"
                      :label="
                        availableColumns.find((c) => c.key === col)?.title
                      "
                    >
                      <a-input
                        v-if="product[col] !== undefined"
                        v-model:value="product[col]"
                        @change="calculateTotals"
                      />
                    </a-form-item>
                  </a-col>
                </template>
              </a-row>

              <a-divider />

              <!-- Product summary -->
              <div class="product-summary">
                <span>{{ $t("pricing.productMargin") }}: </span>
                <strong
                  :style="{
                    color: getMarginColor(calculateProductMargin(product)),
                  }"
                >
                  {{ formatCurrency(calculateProductMargin(product), "PLN") }}
                </strong>
              </div>
            </a-form>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- Summary Bar (always visible) -->
      <div class="summary-bar" v-if="viewMode !== 'table'">
        <a-row :gutter="16" align="middle">
          <a-col :xs="24" :sm="8">
            <div class="summary-item">
              <span class="summary-label"
                >{{ $t("pricing.totalAmount") }}:</span
              >
              <span class="summary-value">{{
                formatCurrency(totals.amount, "PLN")
              }}</span>
            </div>
          </a-col>
          <a-col :xs="24" :sm="8">
            <div class="summary-item">
              <span class="summary-label"
                >{{ $t("pricing.totalMargin") }}:</span
              >
              <span class="summary-value">{{
                formatCurrency(totals.margin, "PLN")
              }}</span>
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
    </a-card>

    <!-- Column Settings Modal -->
    <a-modal
      v-model:open="columnSettingsVisible"
      :title="$t('pricing.columnSettings')"
      @ok="saveColumnSettings"
    >
      <a-checkbox-group v-model:value="selectedColumns" style="width: 100%">
        <a-row>
          <a-col
            v-for="col in availableColumns"
            :key="col.key"
            :span="24"
            style="margin-bottom: 8px"
          >
            <a-checkbox :value="col.key" :disabled="col.required">
              {{ col.title }}
              <a-tag v-if="col.required" size="small" color="blue">
                {{ $t("pricing.required") }}
              </a-tag>
            </a-checkbox>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </a-modal>

    <!-- Edit Product Modal -->
    <a-modal
      v-model:open="editModalVisible"
      :title="$t('pricing.editProduct')"
      width="800px"
      @ok="saveProductEdit"
    >
      <a-form
        v-if="editingProduct"
        :label-col="{ span: 8 }"
        :wrapper-col="{ span: 16 }"
      >
        <!-- Edit form content same as accordion -->
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import {
  TableOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import {
  fetchProductsFromBitrix,
  fetchSuppliersFromBitrix,
  fetchSupplierPrice,
  saveDealToBitrix,
  fetchColumnConfiguration,
} from "@/api/bitrix24";

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
  supplierPrice?: number;
  [key: string]: any;
}

interface Supplier {
  id: string;
  name: string;
}

// State
const loading = ref(false);
const saving = ref(false);
const viewMode = ref<"table" | "cards" | "accordion">("table");
const products = ref<Product[]>([]);
const suppliers = ref<Supplier[]>([]);
const activeKeys = ref<string[]>([]);
const columnSettingsVisible = ref(false);
const editModalVisible = ref(false);
const editingProduct = ref<Product | null>(null);

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
const availableColumns = ref([
  { key: "product", title: t("pricing.product"), required: true },
  { key: "quantity", title: t("pricing.quantity"), required: true },
  { key: "salePrice", title: t("pricing.salePrice"), required: true },
  { key: "purchasePrice", title: t("pricing.purchasePrice"), required: false },
  { key: "supplier", title: t("pricing.supplier"), required: false },
  { key: "transportCost", title: t("pricing.transportCost"), required: false },
  { key: "packagingCost", title: t("pricing.packagingCost"), required: false },
]);

const selectedColumns = ref([
  "product",
  "quantity",
  "salePrice",
  "purchasePrice",
]);

const visibleColumns = computed(() => {
  return availableColumns.value
    .filter((col) => selectedColumns.value.includes(col.key))
    .map((col) => ({
      title: col.title,
      key: col.key,
      dataIndex: col.key,
      slots: { customRender: col.key },
      width: col.key === "product" ? 200 : 150,
    }));
});

// Methods
const convertToPLN = (amount: number, currency: string): number => {
  if (currency === "PLN") return amount;
  if (currency === "USD") return amount * exchangeRates.usdToPln;
  if (currency === "EUR") return amount * exchangeRates.eurToPln;
  return amount;
};

const formatCurrency = (amount: number, currency: string): string => {
  return `${amount.toFixed(2)} ${currency}`;
};

const calculateProductMargin = (product: Product): number => {
  const salePricePLN = convertToPLN(product.salePrice, product.saleCurrency);
  const purchasePricePLN = convertToPLN(
    product.purchasePrice,
    product.purchaseCurrency
  );
  const transportCostPLN = convertToPLN(
    product.transportCost,
    product.transportCurrency
  );
  const packagingCostPLN = convertToPLN(
    product.packagingCost,
    product.packagingCurrency
  );

  const totalCost = purchasePricePLN + transportCostPLN + packagingCostPLN;
  return (salePricePLN - totalCost) * product.quantity;
};

const calculateTotals = () => {
  totals.amount = products.value.reduce((sum, product) => {
    return (
      sum +
      convertToPLN(product.salePrice * product.quantity, product.saleCurrency)
    );
  }, 0);

  totals.margin = products.value.reduce((sum, product) => {
    return sum + calculateProductMargin(product);
  }, 0);
};

const getMarginColor = (margin: number): string => {
  if (margin > 0) return "#52c41a";
  if (margin < 0) return "#f5222d";
  return "#d9d9d9";
};

const getAccordionHeader = (product: Product): string => {
  const margin = calculateProductMargin(product);
  return `${product.name} - ${t("pricing.margin")}: ${formatCurrency(
    margin,
    "PLN"
  )}`;
};

const getFieldComponent = (fieldKey: string, product: Product) => {
  // Визначаємо який компонент використати для поля
  switch (fieldKey) {
    case "quantity":
      return "a-input-number";
    case "salePrice":
    case "purchasePrice":
    case "transportCost":
    case "packagingCost":
      return "div"; // Обгортка для ціни + валюти
    case "supplier":
      return "a-select";
    default:
      return "span"; // Для read-only полів
  }
};

const getFieldProps = (fieldKey: string, product: Product) => {
  // Повертаємо пропси для компонента
  const baseProps = {
    "v-model:value": product[fieldKey],
    "@change": calculateTotals,
  };

  if (fieldKey === "quantity") {
    return { ...baseProps, min: 0 };
  }

  // Для інших типів полів
  return baseProps;
};

// API Methods (stubs)
const refreshProducts = async () => {
  loading.value = true;
  try {
    // TODO: Implement actual API call
    const data = await fetchProductsFromBitrix();
    products.value = data;
    calculateTotals();
    message.success(t("pricing.productsLoaded"));
  } catch (error) {
    message.error(t("pricing.loadError"));
  } finally {
    loading.value = false;
  }
};

const onSupplierChange = async (product: Product, supplierId: string) => {
  try {
    // TODO: Implement actual API call
    const price = await fetchSupplierPrice(product.id, supplierId);
    if (price) {
      product.purchasePrice = price.amount;
      product.purchaseCurrency = price.currency;
      product.supplierPrice = price.amount;
      calculateTotals();
    }
  } catch (error) {
    message.error(t("pricing.priceLoadError"));
  }
};

const saveToDeal = async () => {
  saving.value = true;
  try {
    // TODO: Implement actual API call
    await saveDealToBitrix({
      products: products.value,
      totals: totals,
      exchangeRates: exchangeRates,
    });
    message.success(t("pricing.saveSuccess"));
  } catch (error) {
    message.error(t("pricing.saveError"));
  } finally {
    saving.value = false;
  }
};

const showColumnSettings = () => {
  columnSettingsVisible.value = true;
};

const saveColumnSettings = () => {
  columnSettingsVisible.value = false;
  localStorage.setItem("pricingColumns", JSON.stringify(selectedColumns.value));
};

const editProduct = (product: Product) => {
  editingProduct.value = { ...product };
  editModalVisible.value = true;
};

const saveProductEdit = () => {
  if (editingProduct.value) {
    const index = products.value.findIndex(
      (p) => p.id === editingProduct.value!.id
    );
    if (index > -1) {
      products.value[index] = { ...editingProduct.value };
      calculateTotals();
    }
  }
  editModalVisible.value = false;
};

// Lifecycle
onMounted(async () => {
  // Load saved column preferences
  const savedColumns = localStorage.getItem("pricingColumns");
  if (savedColumns) {
    selectedColumns.value = JSON.parse(savedColumns);
  }

  // Load initial data
  await refreshProducts();

  // TODO: Load suppliers
  suppliers.value = await fetchSuppliersFromBitrix();

  // TODO: Load dynamic columns from Bitrix
  const dynamicColumns = await fetchColumnConfiguration();
  if (dynamicColumns) {
    availableColumns.value = [...availableColumns.value, ...dynamicColumns];
  }
});
</script>

<style scoped>
.pricing-calculator {
  padding: 16px;
}

.currency-card {
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

.currency-rate {
  width: 100px;
}

.controls-card {
  margin-bottom: 16px;
}

.products-card {
  margin-bottom: 16px;
}

.price-input-group {
  display: flex;
  gap: 4px;
}

.pricing-table :deep(.ant-table) {
  font-size: 13px;
}

.table-summary {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 16px;
}

:global(.dark) .table-summary {
  background: rgba(255, 255, 255, 0.04);
}

.summary-bar {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 24px;
}

:global(.dark) .summary-bar {
  background: rgba(255, 255, 255, 0.04);
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: var(--text-color);
}

.summary-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
}

.product-summary {
  text-align: center;
  font-size: 16px;
}

/* Mobile responsive */
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
}
</style>
