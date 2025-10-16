<!-- frontend/src/components/pricing/ColumnSettingsModal.vue -->

<template>
  <a-modal
    v-model:open="visible"
    :title="$t('pricing.columnSettings')"
    width="700px"
    :maskClosable="false"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <div class="column-settings">
      <!-- Info message -->
      <a-alert
        :message="$t('pricing.columnSettingsInfo')"
        type="info"
        show-icon
        closable
        style="margin-bottom: 16px"
      />

      <!-- All Columns Section (unified list) -->
      <div class="section">
        <h4 class="section-title">
          {{ $t('pricing.availableColumns') }}
          <a-tag color="blue" size="small">
            {{ visibleCount }} / {{ allColumnsList.length }} {{ $t('pricing.visible') }}
          </a-tag>
        </h4>
        
        <div class="columns-header">
          <span class="header-drag">{{ $t('pricing.order') }}</span>
          <span class="header-visible">{{ $t('pricing.show') }}</span>
          <span class="header-name">{{ $t('pricing.columnName') }}</span>
          <span class="header-status">{{ $t('pricing.status') }}</span>
        </div>

        <draggable
          v-model="allColumnsList"
          item-key="key"
          handle=".drag-handle"
          :animation="200"
          class="column-list"
          @end="onDragEnd"
        >
          <template #item="{ element, index }">
            <div 
              class="column-item"
              :class="{ 'column-locked': element.locked }"
            >
              <!-- Drag handle -->
              <div class="column-drag">
                <HolderOutlined class="drag-handle" />
                <span class="column-order">{{ index + 1 }}</span>
              </div>

              <!-- Visibility checkbox -->
              <div class="column-checkbox">
                <a-checkbox 
                  v-model:checked="element.visible"
                  :disabled="element.locked"
                />
              </div>

              <!-- Column name -->
              <div class="column-name">
                {{ element.title }}
              </div>

              <!-- Status tag -->
              <div class="column-status">
                <a-tag 
                  v-if="element.locked" 
                  color="blue" 
                  size="small"
                >
                  {{ $t('pricing.required') }}
                </a-tag>
                <a-tag 
                  v-else-if="element.isDynamic"
                  color="green" 
                  size="small"
                >
                  {{ $t('pricing.productField') }}
                </a-tag>
                <a-tag 
                  v-else
                  color="default" 
                  size="small"
                >
                  {{ $t('pricing.optional') }}
                </a-tag>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <!-- Quick actions -->
      <div class="quick-actions">
        <a-button size="small" @click="showAllColumns">
          <EyeOutlined /> {{ $t('pricing.showAll') }}
        </a-button>
        <a-button size="small" @click="hideOptionalColumns">
          <EyeInvisibleOutlined /> {{ $t('pricing.hideOptional') }}
        </a-button>
      </div>
    </div>

    <!-- Footer with Reset Button -->
    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleReset" type="default">
          <ReloadOutlined />
          {{ $t('pricing.resetToDefaults') }}
        </a-button>
        <div class="footer-actions">
          <a-button @click="handleCancel">
            {{ $t('common.cancel') }}
          </a-button>
          <a-button type="primary" @click="handleSave">
            {{ $t('common.ok') }}
          </a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { DEFAULT_COLUMNS, DYNAMIC_FIELDS_MOCK } from '@/config/defaultColumns.config'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import { 
  HolderOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined 
} from '@ant-design/icons-vue'

const { t } = useI18n()

// Types
interface ColumnConfig {
  key: string
  title: string
  required: boolean
  locked: boolean
  visible: boolean
  order: number
  isDynamic?: boolean  // For Bitrix24 product fields
}

// Props
interface Props {
  open: boolean
  columns: ColumnConfig[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', columns: ColumnConfig[]): void
}>()

// Local state
const visible = ref(props.open)
const allColumnsList = ref<ColumnConfig[]>([])

// Computed
const visibleCount = computed(() => {
  return allColumnsList.value.filter(col => col.visible).length
})

// Watch for props changes
watch(() => props.open, (newValue) => {
  visible.value = newValue
  if (newValue) {
    initializeColumns()
  }
})

watch(visible, (newValue) => {
  emit('update:open', newValue)
})

// Initialize columns from props
const initializeColumns = () => {
  const sortedColumns = [...props.columns].sort((a, b) => a.order - b.order)
  allColumnsList.value = sortedColumns.map(col => ({ ...col }))
}

// Get default column configuration
const getDefaultColumns = (): ColumnConfig[] => {
  // Map and add translations
  const staticColumns = DEFAULT_COLUMNS.map(col => ({
    ...col,
    title: t(`pricing.${col.key}`)
  }))
  
  const dynamicFields = DYNAMIC_FIELDS_MOCK.map(col => ({
    ...col,
    title: col.key // або title з API
  }))
  
  return [...staticColumns, ...dynamicFields]
}

// Handlers
const onDragEnd = () => {
  // Update order after drag
  allColumnsList.value.forEach((col, index) => {
    col.order = index + 1
  })
}

const handleSave = () => {
  // Update order before saving
  const columnsToSave = allColumnsList.value.map((col, index) => ({
    ...col,
    order: index + 1
  }))
  
  emit('save', columnsToSave)
  visible.value = false
}

const handleCancel = () => {
  visible.value = false
}

const handleReset = () => {
  const defaultColumns = getDefaultColumns()
  allColumnsList.value = defaultColumns.sort((a, b) => a.order - b.order)
}

const showAllColumns = () => {
  allColumnsList.value.forEach(col => {
    if (!col.locked) {
      col.visible = true
    }
  })
}

const hideOptionalColumns = () => {
  allColumnsList.value.forEach(col => {
    if (!col.locked && !col.isDynamic) {
      col.visible = false
    }
  })
}

// Initialize on mount
initializeColumns()
</script>

<style scoped>
.column-settings {
  padding: 8px 0;
}

.section {
  margin-bottom: 16px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.columns-header {
  display: grid;
  grid-template-columns: 80px 60px 1fr 120px;
  gap: 12px;
  padding: 8px 12px;
  background: var(--ant-background-color-light);
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-secondary);
}

.column-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.column-list::-webkit-scrollbar {
  width: 6px;
}

.column-list::-webkit-scrollbar-track {
  background: transparent;
}

.column-list::-webkit-scrollbar-thumb {
  background: var(--ant-border-color);
  border-radius: 3px;
}

.column-list::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

.column-item {
  display: grid;
  grid-template-columns: 80px 60px 1fr 120px;
  gap: 12px;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--ant-border-color);
  border-radius: 6px;
  background: var(--ant-background-color);
  transition: all 0.2s;
}

.column-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-color-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.column-item.column-locked {
  background: var(--ant-background-color-light);
}

.column-drag {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  cursor: move;
  font-size: 16px;
  color: var(--text-color-secondary);
  transition: color 0.2s;
}

.drag-handle:hover {
  color: var(--primary-color);
}

.column-order {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-tertiary);
  min-width: 20px;
}

.column-checkbox {
  display: flex;
  justify-content: center;
}

.column-name {
  font-size: 13px;
  color: var(--text-color);
}

.column-status {
  display: flex;
  justify-content: flex-end;
}

.quick-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--ant-border-color);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

/* Dark theme adjustments */
[data-theme='dark'] .column-item {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
}

[data-theme='dark'] .column-item:hover {
  border-color: var(--primary-color);
  background: rgba(114, 46, 209, 0.1);
}

[data-theme='dark'] .column-item.column-locked {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme='dark'] .columns-header {
  background: rgba(255, 255, 255, 0.04);
}

/* Dragging state */
.sortable-ghost {
  opacity: 0.4;
  background: var(--primary-color-bg);
}

.sortable-drag {
  opacity: 0.9;
  transform: rotate(1deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .columns-header {
    grid-template-columns: 60px 50px 1fr 100px;
    font-size: 11px;
  }

  .column-item {
    grid-template-columns: 60px 50px 1fr 100px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }

  .footer-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .quick-actions {
    flex-direction: column;
  }

  .quick-actions button {
    width: 100%;
  }
}
</style>