// frontend/src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue')
  },
  {
    path: '/license',
    name: 'license',
    component: () => import('@/views/LicenseView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Auto-resize Bitrix24 frame при зміні роуту
router.afterEach(() => {
  setTimeout(() => {
    if (window.BX24?.fitWindow) {
      window.BX24.fitWindow()
    }
  }, 100)
})

export default router