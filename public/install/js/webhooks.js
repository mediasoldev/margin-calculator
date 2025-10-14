// install/js/webhooks.js
/**
 * Bitrix24 Webhook Management
 * Handles event registration and webhook setup
 */

const WebhooksManager = {
    
    /**
     * Get webhook URL
     */
    getWebhookUrl: function() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const basePath = window.location.pathname.replace(/\/install\/.*$/, '');
        return protocol + '//' + host + basePath + '/api/webhook.php';
    },
    
    /**
     * Get all registered events
     */
    getAllEvents: function(callback) {
        console.log('[WEBHOOKS] Getting all registered events...');
        
        BX24.callMethod('event.get', {}, function(result) {
            if (result.error()) {
                console.error('[WEBHOOKS] Error getting events:', result.error());
                callback(null);
                return;
            }
            
            const events = result.data() || [];
            console.log('[WEBHOOKS] Found events:', events.length);
            callback(events);
        });
    },
    
    /**
     * Remove all old event handlers
     */
    removeAllHandlers: function(callback) {
        this.getAllEvents(function(events) {
            if (!events || events.length === 0) {
                console.log('[WEBHOOKS] No events to remove');
                callback(true);
                return;
            }
            
            const webhookUrl = WebhooksManager.getWebhookUrl();
            const commands = {};
            let commandCount = 0;
            
            events.forEach(function(event, index) {
                // Remove all handlers pointing to our webhook
                if (event.handler && 
                    (event.handler.indexOf(webhookUrl) !== -1 || 
                     event.handler.indexOf('webhook.php') !== -1 ||
                     event.handler.indexOf('/api/') !== -1)) {
                    
                    commands['unbind_' + commandCount] = [
                        'event.unbind',
                        {
                            event: event.event,
                            handler: event.handler
                        }
                    ];
                    commandCount++;
                }
            });
            
            if (commandCount > 0) {
                console.log('[WEBHOOKS] Removing old handlers:', commandCount);
                
                BX24.callBatch(commands, function(result) {
                    console.log('[WEBHOOKS] Old handlers removed successfully');
                    callback(true);
                });
            } else {
                console.log('[WEBHOOKS] No handlers to remove');
                callback(true);
            }
        });
    },
    
    /**
     * Register new event handlers
     */
    registerHandlers: function(callback) {
        const webhookUrl = this.getWebhookUrl();
        console.log('[WEBHOOKS] Registering webhooks at URL:', webhookUrl);
        
        const commands = {
            install: [
                'event.bind',
                {
                    event: 'ONAPPINSTALL',
                    handler: webhookUrl,
                    auth_type: 0
                }
            ],
            uninstall: [
                'event.bind',
                {
                    event: 'ONAPPUNINSTALL',
                    handler: webhookUrl,
                    auth_type: 0
                }
            ],
            update: [
                'event.bind',
                {
                    event: 'ONAPPUPDATE',
                    handler: webhookUrl,
                    auth_type: 0
                }
            ]
        };
        
        BX24.callBatch(commands, function(result) {
            if (!result || typeof result !== 'object') {
                console.error('[WEBHOOKS] Error registering handlers');
                callback(false, 'Failed to register event handlers');
                return;
            }
            
            // Check for errors
            let hasError = false;
            let errorMessage = '';
            
            for (let key in result) {
                if (result[key] && result[key].error && result[key].error()) {
                    console.error('[WEBHOOKS] Error in ' + key + ':', result[key].error());
                    hasError = true;
                    errorMessage = result[key].error();
                }
            }
            
            if (hasError) {
                console.warn('[WEBHOOKS] Some handlers failed to register');
                // Continue anyway
            }
            
            console.log('[WEBHOOKS] Event handlers registered successfully');
            callback(true);
        });
    },
    
    /**
     * Call installation webhook
     */
    callInstallWebhook: function(params, callback) {
        const webhookUrl = this.getWebhookUrl();
        const authData = BX24.getAuth();
        
        const installData = {
            event: 'ONAPPINSTALL',
            auth: {
                domain: params.DOMAIN || authData.domain,
                member_id: params.MEMBER_ID || authData.member_id,
                user_id: BX24.getUserId ? BX24.getUserId() : 0,
                access_token: params.AUTH_ID || authData.access_token,
                refresh_token: params.REFRESH_ID || authData.refresh_token,
                application_token: params.APP_SID || '',
                expires_in: params.AUTH_EXPIRES || authData.expires_in,
                server_endpoint: 'oauth.bitrix.info',
                client_endpoint: 'https://' + (params.DOMAIN || authData.domain) + '/rest/'
            },
            data: {
                VERSION: 1,
                ACTIVE: 'Y',
                INSTALLED: 'Y',
                LANGUAGE_ID: BX24.getLang ? BX24.getLang() : 'en'
            }
        };
        
        console.log('[WEBHOOKS] Sending installation data to webhook');
        
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(installData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Webhook returned status ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.message || 'Installation error');
            }
            
            console.log('[WEBHOOKS] Installation webhook completed:', data);
            callback(true);
        })
        .catch(error => {
            console.error('[WEBHOOKS] Webhook error:', error);
            // Continue even if webhook fails
            callback(true);
        });
    },
    
    /**
     * Full webhook setup process
     */
    setupWebhooks: function(params, progressCallback, completeCallback) {
        // Step 1: Remove old handlers
        progressCallback('Removing old handlers...');
        
        this.removeAllHandlers((success) => {
            if (!success) {
                completeCallback(false, 'Failed to remove old handlers');
                return;
            }
            
            // Step 2: Register new handlers
            progressCallback('Registering new handlers...');
            
            this.registerHandlers((success, error) => {
                if (!success) {
                    completeCallback(false, error);
                    return;
                }
                
                // Step 3: Call installation webhook
                progressCallback('Calling installation webhook...');
                
                this.callInstallWebhook(params, (success) => {
                    completeCallback(success);
                });
            });
        });
    }
};

// Export for use in other modules
window.WebhooksManager = WebhooksManager;