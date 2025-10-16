// frontend/src/router/licenseGuard.ts

import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export function licenseGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  // Check if license is valid from APP_DATA
  const license = window.APP_DATA?.license
  
  // If no license data, allow navigation (shouldn't happen)
  if (!license) {
    next()
    return
  }
  
  // If license is valid, allow navigation
  if (license.is_valid) {
    next()
    return
  }
  
  // License is invalid - only allow /license route
  if (to.path === '/license') {
    next()
    return
  }
  
  // Redirect to license page
  console.warn('[LicenseGuard] License invalid, redirecting to /license')
  next('/license')
}