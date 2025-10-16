<!-- frontend/src/components/pricing/AddSupplierModal.vue -->

<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? $t('pricing.editSupplier') : $t('pricing.addSupplier')"
    width="500px"
    :maskClosable="false"
    @ok="handleSave"
    @cancel="handleCancel"
  >
    <a-form
      :model="formData"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 16 }"
      class="supplier-form"
    >
      <!-- Company Selection -->
      <a-form-item :label="$t('pricing.company')" required>
        <a-input
          v-model:value="formData.companyName"
          :placeholder="$t('pricing.selectCompany')"
          readonly
          @click="selectCompany"
          style="cursor: pointer"
        >
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>
      </a-form-item>

      <!-- Price -->
      <a-form-item :label="$t('pricing.purchasePrice')" required>
        <a-input-number
          v-model:value="formData.price"
          :min="0"
          :step="0.01"
          :precision="2"
          style="width: 100%"
          :placeholder="$t('pricing.enterPrice')"
        />
      </a-form-item>

      <!-- Currency -->
      <a-form-item :label="$t('pricing.currency')" required>
        <a-select
          v-model:value="formData.currency"
          style="width: 100%"
          :placeholder="$t('pricing.selectCurrency')"
        >
          <a-select-option value="PLN">PLN</a-select-option>
          <a-select-option value="USD">USD</a-select-option>
          <a-select-option value="EUR">EUR</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  open: boolean
  productId: string
  editData?: {
    companyId: string
    companyName: string
    price: number
    currency: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: { companyId: string; companyName: string; price: number; currency: string }): void
}>()

// Local state
const visible = ref(props.open)
const isEdit = ref(false)

const formData = ref({
  companyId: '',
  companyName: '',
  price: 0,
  currency: 'PLN'
})

// Watch for props changes
watch(() => props.open, (newValue) => {
  visible.value = newValue
  if (newValue) {
    if (props.editData) {
      isEdit.value = true
      formData.value = { ...props.editData }
    } else {
      isEdit.value = false
      resetForm()
    }
  }
})

watch(visible, (newValue) => {
  emit('update:open', newValue)
})

// Select company using BX24
const selectCompany = () => {
  if (!window.BX24) {
    message.error('BX24 not available')
    return
  }

  window.BX24.selectCRM({
    entityType: ['company'],
    multiple: false
  }, (result: any) => {
    console.log('[AddSupplier] BX24.selectCRM result:', result)
    
    if (result && result.company && result.company[0]) {
      const company = result.company[0]
      formData.value.companyId = company.id.replace('CO_', '')
      formData.value.companyName = company.title
    }
  })
}

// Reset form
const resetForm = () => {
  formData.value = {
    companyId: '',
    companyName: '',
    price: 0,
    currency: 'PLN'
  }
}

// Validate form
const validateForm = (): boolean => {
  if (!formData.value.companyId) {
    message.error(t('pricing.pleaseSelectCompany'))
    return false
  }
  if (!formData.value.price || formData.value.price <= 0) {
    message.error(t('pricing.pleaseEnterValidPrice'))
    return false
  }
  if (!formData.value.currency) {
    message.error(t('pricing.pleaseSelectCurrency'))
    return false
  }
  return true
}

// Handlers
const handleSave = () => {
  if (!validateForm()) return
  
  emit('save', {
    companyId: formData.value.companyId,
    companyName: formData.value.companyName,
    price: formData.value.price,
    currency: formData.value.currency
  })
  
  visible.value = false
}

const handleCancel = () => {
  visible.value = false
}
</script>

<style scoped>
.supplier-form {
  padding-top: 16px;
}

.supplier-form :deep(.ant-form-item) {
  margin-bottom: 16px;
}

.supplier-form :deep(.ant-input[readonly]) {
  cursor: pointer;
  background-color: var(--ant-background-color);
}

.supplier-form :deep(.ant-input[readonly]:hover) {
  border-color: var(--primary-color);
}
</style>