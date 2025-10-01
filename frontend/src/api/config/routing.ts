// frontend/src/api/config/routing.ts

export type ApiSource = 'direct' | 'proxy'
export type ApiMethod = string

export interface RoutingConfig {
  // Specific method routing
  methods: Record<string, ApiSource>
  
  // Pattern-based routing
  patterns: Array<{
    pattern: string
    source: ApiSource
    description?: string
  }>
  
  // Default routing when no match
  default: ApiSource
}

/**
 * API Routing Configuration
 * Defines which API methods go through direct BX24 calls vs backend proxy
 */
export const apiRouting: RoutingConfig = {
  methods: {
    // Direct calls - user has permissions
    'crm.deal.get': 'direct',
    'crm.deal.list': 'direct',
    'crm.deal.productrows.get': 'direct',
    'crm.product.get': 'direct',
    'crm.product.list': 'direct',
    'crm.company.get': 'direct',
    'crm.contact.get': 'direct',
    'user.current': 'direct',
    'user.get': 'direct',
    
    // Proxy calls - need admin permissions
    'crm.deal.update': 'proxy',
    'crm.deal.productrows.set': 'proxy',
    'crm.product.add': 'proxy',
    'crm.product.update': 'proxy',
    'crm.productsection.list': 'proxy',
    'crm.currency.list': 'proxy',
    'crm.catalog.list': 'proxy',
    
    // Custom entity operations - always proxy
    'entity.add': 'proxy',
    'entity.update': 'proxy',
    'entity.delete': 'proxy',
    'entity.item.add': 'proxy',
    'entity.item.update': 'proxy',
    
    // Placement operations
    'placement.bind': 'proxy',
    'placement.unbind': 'proxy',
    'placement.get': 'direct'
  },
  
  patterns: [
    {
      pattern: '^user\\.admin',
      source: 'proxy',
      description: 'All admin user methods'
    },
    {
      pattern: '^crm\\.(lead|deal|contact|company)\\.add$',
      source: 'proxy',
      description: 'Creating CRM entities'
    },
    {
      pattern: '^crm\\.(lead|deal|contact|company)\\.delete$',
      source: 'proxy',
      description: 'Deleting CRM entities'
    },
    {
      pattern: '\\.fields$',
      source: 'direct',
      description: 'Field descriptions - usually available to all'
    },
    {
      pattern: '^task\\.',
      source: 'direct',
      description: 'Task operations - user level'
    },
    {
      pattern: '^bizproc\\.',
      source: 'proxy',
      description: 'Business process operations'
    }
  ],
  
  default: 'direct' // Default to direct for unknown methods
}

/**
 * Permission requirements for methods
 * Used to show user what permissions are needed
 */
export const permissionRequirements: Record<string, string[]> = {
  'crm.deal.update': ['crm', 'deal_write'],
  'crm.product.add': ['crm', 'catalog_write'],
  'crm.product.update': ['crm', 'catalog_write'],
  'entity.add': ['entity', 'admin'],
  'entity.update': ['entity', 'admin'],
  'entity.delete': ['entity', 'admin']
}

/**
 * Check if method requires special permissions
 */
export function requiresPermissions(method: string): boolean {
  return apiRouting.methods[method] === 'proxy' || 
         apiRouting.patterns.some(p => new RegExp(p.pattern).test(method) && p.source === 'proxy')
}

/**
 * Get required permissions for method
 */
export function getRequiredPermissions(method: string): string[] {
  return permissionRequirements[method] || []
}