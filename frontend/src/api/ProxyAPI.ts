// frontend/src/api/ProxyAPI.ts

import axios, { AxiosInstance } from 'axios'

/**
 * Proxy API calls through backend
 * Uses admin OAuth tokens stored on server
 * 
 * TODO: Backend повинен мати наступні endpoints:
 * POST /api/bitrix24/call - для одиночних викликів
 * POST /api/bitrix24/batch - для batch викликів
 * 
 * Backend повинен:
 * 1. Зберігати OAuth токени адміна
 * 2. Автоматично оновлювати токени при експірації
 * 3. Проксувати запити до Bitrix24 REST API
 */
export class ProxyAPI {
  private client: AxiosInstance
  
  constructor() {
    // TODO: Замінити на реальний URL вашого backend
    const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api'
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true // для CORS з cookies
    })

    // Interceptor для додавання auth token якщо використовуєте
    this.client.interceptors.request.use((config) => {
      // TODO: Додати вашу логіку авторизації
      // Наприклад JWT token:
      // const token = localStorage.getItem('auth_token')
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`
      // }
      
      // Додаємо домен Bitrix24 якщо є
      if (window.BX24) {
        const auth = window.BX24.getAuth()
        if (auth?.domain) {
          config.headers['X-Bitrix24-Domain'] = auth.domain
        }
      }
      
      return config
    })
  }

  async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    try {
      // TODO: Адаптувати під формат вашого backend API
      const response = await this.client.post('/bitrix24/call', {
        method,
        params
      })
      
      // Припускаємо що backend повертає { success: true, result: data }
      if (response.data.success) {
        return response.data.result
      } else {
        throw new Error(response.data.error || 'Proxy call failed')
      }
    } catch (error: any) {
      console.error('ProxyAPI call error:', error)
      throw {
        code: error.response?.data?.error_code || 'PROXY_ERROR',
        message: error.response?.data?.error_description || error.message,
        method
      }
    }
  }

  async batch(calls: Array<{ method: string; params?: Record<string, any> }>): Promise<any[]> {
    try {
      // TODO: Адаптувати під формат вашого backend API
      const response = await this.client.post('/bitrix24/batch', {
        calls
      })
      
      if (response.data.success) {
        return response.data.results
      } else {
        throw new Error(response.data.error || 'Proxy batch failed')
      }
    } catch (error: any) {
      console.error('ProxyAPI batch error:', error)
      throw {
        code: error.response?.data?.error_code || 'PROXY_BATCH_ERROR',
        message: error.response?.data?.error_description || error.message
      }
    }
  }
}

/**
 * Приклад формату відповіді backend:
 * 
 * Успіх:
 * {
 *   success: true,
 *   result: { ... дані від Bitrix24 ... }
 * }
 * 
 * Помилка:
 * {
 *   success: false,
 *   error: "Error message",
 *   error_code: "ACCESS_DENIED",
 *   error_description: "Detailed error description"
 * }
 * 
 * Для batch:
 * {
 *   success: true,
 *   results: [ ...масив результатів... ]
 * }
 */