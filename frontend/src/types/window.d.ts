// frontend/src/types/window.d.ts

export interface AppDataLicense {
  license_key: string | null
  is_valid: boolean
  is_active: boolean
  is_trial: boolean
  trial_used: boolean
  trial_end_date: string | null
  license_valid_until: string | null
  license_activated_at: string | null
  expires_at: string | null
  licensed_to: string
  license_activated_by: number | null
  type: string
  status_message: string
  days_remaining: number
  is_blocked: boolean
  block_reason: string | null
  max_users: number | null
  features: string[] | any
  installed_at: string | null
  created_at: string | null
}

export interface AppData {
  domain: string
  protocol: boolean
  lang: string
  app_sid: string
  auth_id: string
  auth_expires: string
  refresh_id: string
  member_id: string
  user_id: string
  placement: string
  placement_options: any[]
  is_admin: boolean
  settings: Record<string, any>
  api_endpoint: string
  session_token: string
  license: AppDataLicense
}

declare global {
  interface Window {
    APP_DATA?: AppData
    BX24?: any
  }
}

export {}