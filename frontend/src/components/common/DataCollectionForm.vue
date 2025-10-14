<!-- frontend/src/components/common/DataCollectionForm.vue -->

<template>
  <div>
    <a-modal
      v-model:open="visible"
      :title="null"
      :maskClosable="false"
      :closable="false"
      :footer="null"
      class="modal-collection-form"
    >
      <div :style="{ height: modalHeight }">
        <iframe
          :src="iframeUrl"
          :style="{
            width: iframeWidth,
            height: iframeHeight,
            border: 'none',
          }"
          ref="contactFrame"
        ></iframe>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useLicense } from '@/composables/useLicense'
import { useBX24 } from '@/composables/useBX24'
import { DATA_COLLECTION_CONFIG } from '@/config/dataCollection.config'
import type {
  GetRecordRequest,
  GetRecordResponse,
  AddRecordRequest,
  AddRecordResponse,
  IframeSizeResponse,
  PostMessageData,
  PostMessageToIframe
} from '@/types/dataCollection.types'

// Composables
const { license } = useLicense()
const bx24 = useBX24()

// State
const visible = ref(false)
const modalHeight = ref(DATA_COLLECTION_CONFIG.defaultSizes.modalHeight)
const iframeWidth = ref(DATA_COLLECTION_CONFIG.defaultSizes.iframeWidth)
const iframeHeight = ref(DATA_COLLECTION_CONFIG.defaultSizes.iframeHeight)
const contactFrame = ref<HTMLIFrameElement | null>(null)

// Computed
const iframeUrl = computed(() => {
  const lang = bx24.getLang() || 'en'
  return `${DATA_COLLECTION_CONFIG.urls.formBase}?lang=${lang}&q=${Date.now()}`
})

// Methods
const sendMessageToIframe = (): void => {
  const iframe = contactFrame.value
  if (iframe && iframe.contentWindow) {
    const message: PostMessageToIframe = {
      action: 'getOrigin',
      lang: bx24.getLang() || 'en',
      domain: window.location.origin,
    }
    
    iframe.contentWindow.postMessage(
      message,
      DATA_COLLECTION_CONFIG.allowedOrigins[0]
    )
  } else {
    console.warn('Iframe not found')
  }
}

const receiveMessage = async (event: MessageEvent<PostMessageData>): Promise<void> => {
  // Check if origin is allowed
  if (!DATA_COLLECTION_CONFIG.allowedOrigins.includes(event.origin)) {
    return
  }

  // Check if message contains form values
  if (event?.data?.values) {
    try {
      const domain = bx24.getDomain() || window.location.hostname
      const requestData: AddRecordRequest = {
        domain,
        application: DATA_COLLECTION_CONFIG.application.name,
        version: DATA_COLLECTION_CONFIG.application.version,
        ...event.data.values,
      }

      await addRecord(requestData)
      visible.value = false
    } catch (error) {
      console.error('Error processing form data:', error)
    }
  }
}

const showModal = (): void => {
  visible.value = true
  setTimeout(() => {
    sendMessageToIframe()
  }, DATA_COLLECTION_CONFIG.timing.postMessageDelay)
}

const fetchApi = async <T>(
  endpoint: string,
  data: Record<string, any>
): Promise<T> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

const getRecord = async (request: GetRecordRequest): Promise<GetRecordResponse> => {
  return fetchApi<GetRecordResponse>(DATA_COLLECTION_CONFIG.urls.api, {
    name: '.get-record',
    ...request,
  })
}

const addRecord = async (request: AddRecordRequest): Promise<AddRecordResponse> => {
  return fetchApi<AddRecordResponse>(DATA_COLLECTION_CONFIG.urls.api, {
    name: '.add-record',
    ...request,
  })
}

const getIframeSize = async (): Promise<void> => {
  try {
    const response = await fetchApi<IframeSizeResponse>(
      DATA_COLLECTION_CONFIG.urls.sizeApi,
      { name: '.iframeSize' }
    )

    if (response?.data) {
      const { modalHeight: mh, iframeWidth: iw, iframeHeight: ih } = response.data

      setTimeout(() => {
        if (mh) modalHeight.value = mh
        if (iw) iframeWidth.value = iw
        if (ih) iframeHeight.value = ih
      }, DATA_COLLECTION_CONFIG.timing.sizeUpdateDelay)
    }
  } catch (error) {
    console.error('Error fetching iframe size:', error)
  }
}

const checkAndShowForm = async (): Promise<void> => {
  // Check if form is enabled in config
  if (!DATA_COLLECTION_CONFIG.enabled) {
    return
  }

  // Check if license is trial
  if (!license.value?.isTrial) {
    return
  }

  // Check if BX24 is available
  if (!window.BX24) {
    console.warn('BX24 is not available, data collection form will not be shown')
    return
  }

  try {
    const domain = bx24.getDomain() || window.location.hostname
    const request: GetRecordRequest = {
      domain,
      application: DATA_COLLECTION_CONFIG.application.name,
      version: DATA_COLLECTION_CONFIG.application.version,
    }

    const response = await getRecord(request)

    // If no record exists, show the form
    if (!response.version) {
      showModal()
      await getIframeSize()
    }
  } catch (error) {
    console.error('Error checking user record:', error)
  }
}

// Lifecycle
onMounted(async () => {
  window.addEventListener('message', receiveMessage)

  // Fit window after mount
  if (window.BX24?.fitWindow) {
    setTimeout(() => {
      window.BX24.fitWindow()
    }, DATA_COLLECTION_CONFIG.timing.fitWindowDelay)
  }

  // Check and show form if needed
  await checkAndShowForm()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', receiveMessage)
})
</script>

<style scoped>
:deep(.modal-collection-form .ant-modal-body) {
  padding: 0;
}
</style>