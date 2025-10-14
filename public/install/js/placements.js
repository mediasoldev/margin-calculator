// install/js/placements.js
/**
 * Bitrix24 Placement Management
 * Handles application placement in CRM
 */

const PlacementsManager = {
    
    /**
     * Placement configuration
     */
    placements: {
        // Deal detail card - tab (ACTIVE)
        dealDetail: {
            placement: 'CRM_DEAL_DETAIL_TAB',
            handler: '/pricing-calculator',
            title: 'Margin Calculator',
            description: 'Calculate product margins and profitability'
        }
        
        /* === EXAMPLE PLACEMENTS (for future use if needed) ===
        
        // Deal list - button
        dealList: {
            placement: 'CRM_DEAL_LIST_MENU',
            handler: '/pricing-calculator-list',
            title: 'Margin Calculator',
            description: 'Bulk margin calculations'
        },
        
        // Contact detail card - tab
        contactDetail: {
            placement: 'CRM_CONTACT_DETAIL_TAB',
            handler: '/pricing-calculator-contact',
            title: 'Margin Calculator',
            description: 'Contact integration'
        },
        
        // Company detail card - tab
        companyDetail: {
            placement: 'CRM_COMPANY_DETAIL_TAB',
            handler: '/pricing-calculator-company',
            title: 'Margin Calculator',
            description: 'Company integration'
        },
        
        // Lead detail card - tab
        leadDetail: {
            placement: 'CRM_LEAD_DETAIL_TAB',
            handler: '/pricing-calculator-lead',
            title: 'Margin Calculator',
            description: 'Lead integration'
        }
        
        === END OF EXAMPLE PLACEMENTS === */
    },
    
    /**
     * Get application base URL
     * Automatically detects version from current path
     * Example: /v1/install/index.php -> https://domain.com/v1
     *          /v2/install/index.php -> https://domain.com/v2
     */
    getBaseUrl: function() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const pathname = window.location.pathname;
        
        // Remove '/install/...' from path and keep version prefix
        // /v1/install/index.php -> /v1
        // /v2/install/index.php -> /v2
        const basePath = pathname.replace(/\/install\/.*$/, '');
        
        const baseUrl = protocol + '//' + host + basePath;
        
        console.log('[PLACEMENTS] Base URL detected:', baseUrl);
        console.log('[PLACEMENTS] Current pathname:', pathname);
        console.log('[PLACEMENTS] Extracted base path:', basePath);
        
        return baseUrl;
    },
    
    /**
     * Get existing placements
     */
    getExistingPlacements: function(callback) {
        console.log('[PLACEMENTS] Getting existing placements...');
        
        BX24.callMethod('placement.get', {}, function(result) {
            if (result.error()) {
                console.error('[PLACEMENTS] Error getting placements:', result.error());
                callback(null);
                return;
            }
            
            const placements = result.data() || [];
            console.log('[PLACEMENTS] Found placements:', placements.length);
            callback(placements);
        });
    },
    
    /**
     * Remove all existing placements
     */
    removeAllPlacements: function(callback) {
        this.getExistingPlacements(function(placements) {
            if (!placements || placements.length === 0) {
                console.log('[PLACEMENTS] No placements to remove');
                callback(true);
                return;
            }
            
            const commands = {};
            let commandCount = 0;
            
            placements.forEach(function(placement, index) {
                commands['unbind_' + commandCount] = [
                    'placement.unbind',
                    {
                        placement: placement.placement
                    }
                ];
                commandCount++;
            });
            
            if (commandCount > 0) {
                console.log('[PLACEMENTS] Removing existing placements:', commandCount);
                
                BX24.callBatch(commands, function(result) {
                    console.log('[PLACEMENTS] Existing placements removed');
                    callback(true);
                });
            } else {
                callback(true);
            }
        });
    },
    
    /**
     * Register placements
     */
    registerPlacements: function(callback) {
        const baseUrl = this.getBaseUrl();
        console.log('[PLACEMENTS] Registering placements with base URL:', baseUrl);
        
        const commands = {};
        let commandCount = 0;
        
        // Build commands for each placement
        for (let key in this.placements) {
            const config = this.placements[key];
            const fullHandlerUrl = baseUrl + config.handler;
            
            console.log('[PLACEMENTS] Placement handler URL:', fullHandlerUrl);
            
            commands['placement_' + commandCount] = [
                'placement.bind',
                {
                    placement: config.placement,
                    handler: fullHandlerUrl,
                    title: config.title,
                    description: config.description
                }
            ];
            commandCount++;
        }
        
        if (commandCount === 0) {
            console.log('[PLACEMENTS] No placements to register');
            callback(true);
            return;
        }
        
        console.log('[PLACEMENTS] Registering placements count:', commandCount);
        
        BX24.callBatch(commands, function(result) {
            if (!result || typeof result !== 'object') {
                console.error('[PLACEMENTS] Error registering placements');
                callback(false, 'Failed to register placements');
                return;
            }
            
            // Check for errors
            let hasError = false;
            let errorMessage = '';
            
            for (let key in result) {
                if (result[key] && result[key].error && result[key].error()) {
                    console.error('[PLACEMENTS] Error in ' + key + ':', result[key].error());
                    hasError = true;
                    errorMessage = result[key].error();
                }
            }
            
            if (hasError) {
                console.warn('[PLACEMENTS] Some placements failed to register');
                // Continue anyway
            }
            
            console.log('[PLACEMENTS] Placements registered successfully');
            callback(true);
        });
    },
    
    /**
     * Full placement setup process
     */
    setupPlacements: function(progressCallback, completeCallback) {
        // Step 1: Remove existing placements
        progressCallback('Removing existing placements...');
        
        this.removeAllPlacements((success) => {
            if (!success) {
                completeCallback(false, 'Failed to remove existing placements');
                return;
            }
            
            // Step 2: Register new placements
            progressCallback('Registering new placements...');
            
            this.registerPlacements((success, error) => {
                if (!success) {
                    completeCallback(false, error);
                    return;
                }
                
                completeCallback(true);
            });
        });
    }
};

// Export for use in other modules
window.PlacementsManager = PlacementsManager;