// frontend/src/types/dataCollection.types.ts

/**
 * Data collection form types
 */

/**
 * User data collected from the form
 */
export interface UserCollectionData {
  domain: string
  application: string
  version: string
  [key: string]: any // Additional fields from form
}

/**
 * API request for checking if record exists
 */
export interface GetRecordRequest {
  domain: string
  application: string
  version: string
}

/**
 * API response for checking if record exists
 */
export interface GetRecordResponse {
  version?: string
  data?: any
  error?: string
}

/**
 * API request for adding new record
 */
export interface AddRecordRequest extends UserCollectionData {}

/**
 * API response for adding new record
 */
export interface AddRecordResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * Iframe size configuration
 */
export interface IframeSizeData {
  modalHeight?: string
  iframeWidth?: string
  iframeHeight?: string
}

/**
 * API response for iframe size
 */
export interface IframeSizeResponse {
  data?: IframeSizeData
  error?: string
}

/**
 * PostMessage data from iframe
 */
export interface PostMessageData {
  action?: string
  values?: Record<string, any>
  [key: string]: any
}

/**
 * PostMessage to iframe
 */
export interface PostMessageToIframe {
  action: string
  lang: string
  domain: string
}