// frontend/src/router/index.ts

import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
    meta: { layout: 'main' }
  },
    // Редірект з index.php на головну
  {
    path: "/index.php",
    redirect: "/"
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("@/views/SettingsView.vue"),
    meta: { layout: 'main' }
  },
  {
    path: "/license",
    name: "license",
    component: () => import("@/views/LicenseView.vue"),
    meta: { layout: 'main' }
  },
  {
    path: "/about",
    name: "about",
    component: () => import("@/views/AboutView.vue"),
    meta: { layout: 'main' }
  },
   // Віджет без хедера
  {
    path: "/pricing-calculator",
    name: "pricingCalculator",
    component: () => import("@/views/PricingCalculatorView.vue"),
    meta: { layout: 'widget' }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Auto-resize Bitrix24 frame при зміні роуту
router.afterEach(() => {
  setTimeout(() => {
    if (window.BX24?.fitWindow) {
      window.BX24.fitWindow();
    }
  }, 100);
});

export default router;
