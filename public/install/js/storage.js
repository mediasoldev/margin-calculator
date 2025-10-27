// install/js/storage.js
/**
 * Bitrix24 Storage Management
 * Handles entity storage creation for application data
 */

const StorageManager = {
    
    /**
     * Storage configuration
     */
    storages: {
        // Storage for saved margin calculations (per deal)
        // Structure: 1 record = 1 deal (unique by deal_id)
        // All calculation data stored in DESCRIPTION as JSON
        marginCalculations: {
            entity: 'm_calculations',
            name: 'Margin Calculations',
            access: {
                X: ['admin', 'user']
            }
        },
        
        // Storage for product suppliers and prices
        // Structure: 1 record = 1 product (unique by product_id)
        // DESCRIPTION contains JSON: array of suppliers with their prices and currencies
        productSuppliers: {
            entity: 'product_suppliers',
            name: 'Product Suppliers',
            access: {
                X: ['admin', 'user']
            }
        }
    },
    
    /**
     * Check if storage exists
     */
    checkStorageExists: function(entityName, callback) {
        
        BX24.callMethod('entity.get', {
            ENTITY: entityName
        }, function(result) {

            if (result.error()) {
                // Error may mean storage doesn't exist
                callback(false);
                return;
            }
            
            const data = result.data();
            if (data && data.ENTITY) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    
    /**
     * Create single storage
     */
    createStorage: function(config, callback) {
        
        BX24.callMethod('entity.add', {
            ENTITY: config.entity,
            NAME: config.name,
            ACCESS: config.access
        }, function(result) {

            if (result.error()) {
                const error = result.error();
                console.error('[STORAGE] Error creating storage:', error);
                
                // If storage already exists - not a critical error
                if (error.indexOf('already exists') !== -1) {
                    console.log('[STORAGE] Storage already exists, continuing');
                    callback(true);
                    return;
                }
                
                callback(false, error);
                return;
            }
            
            callback(true);
        });
    },
    
    /**
     * Create all storages (only if they don't exist)
     * IMPORTANT: We DO NOT delete existing storages to preserve data
     */
    createAllStorages: function(callback) {
        const storageKeys = Object.keys(this.storages);
        let processedCount = 0;
        let hasErrors = false;
        let errorMessages = [];
        
        
        // Process each storage
        const processNext = () => {
            if (processedCount >= storageKeys.length) {
                // All processed
                if (hasErrors) {
                    console.warn('[STORAGE] Some storages had errors:', errorMessages);
                }
                callback(true);
                return;
            }
            
            const key = storageKeys[processedCount];
            const config = this.storages[key];
            processedCount++;
            
            // Check if storage exists
            this.checkStorageExists(config.entity, (exists) => {
                if (exists) {
                    processNext();
                } else {
                    // Create storage
                    this.createStorage(config, (success, error) => {
                        if (!success) {
                            hasErrors = true;
                            errorMessages.push(config.entity + ': ' + error);
                        }
                        processNext();
                    });
                }
            });
        };
        
        // Start processing
        processNext();
    },
    
    /**
     * Full storage setup process
     * NOTE: We only CREATE storages, never DELETE them (to preserve data)
     */
    setupStorages: function(progressCallback, completeCallback) {
        progressCallback('Creating data storages...');
        
        this.createAllStorages((success, error) => {
            if (!success) {
                completeCallback(false, error);
                return;
            }
            
            completeCallback(true);
        });
    }
};

// Export for use in other modules
window.StorageManager = StorageManager;