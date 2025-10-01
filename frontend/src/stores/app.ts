// frontend/src/stores/app.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BX24Auth } from '@/types/bitrix24'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const user = ref<any>(null)
  const auth = ref<BX24Auth | null>(null)
  const domain = ref('')
  const isAdmin = ref(false)
  
  // Getters
  const isAuthenticated = computed(() => !!auth.value?.access_token)
  const userName = computed(() => {
    if (!user.value) return 'Guest'
    return `${user.value.NAME || ''} ${user.value.LAST_NAME || ''}`.trim()
  })
  
  // Actions
  const setAuth = (authData: BX24Auth) => {
    auth.value = authData
    domain.value = authData.domain
  }
  
  const setUser = (userData: any) => {
    user.value = userData
    isAdmin.value = userData?.ADMIN === true
  }
  
  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  
  const reset = () => {
    user.value = null
    auth.value = null
    domain.value = ''
    isAdmin.value = false
    isLoading.value = false
  }
  
  return {
    // State
    isLoading,
    user,
    auth,
    domain,
    isAdmin,
    // Getters
    isAuthenticated,
    userName,
    // Actions
    setAuth,
    setUser,
    setLoading,
    reset
  }
})