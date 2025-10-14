// install/install.js
/**
 * Installation JavaScript
 * Handles the Bitrix24 application installation process
 */

(function() {
    'use strict';
    
    // Get installation parameters
    const params = window.INSTALL_PARAMS || {};
    
    // Configuration
    const config = {
        webhookPath: '/api/webhook.php',
        maxRetries: 3,
        retryDelay: 1000
    };
    
    // Installation steps
    const steps = {
        current: 0,
        total: 4,
        elements: ['step1', 'step2', 'step3', 'step4']
    };
    
    /**
     * Update UI progress
     */
    function updateProgress(step, status) {
        const element = document.getElementById(steps.elements[step - 1]);
        if (!element) return;
        
        // Update step status
        if (status === 'active') {
            element.classList.add('active');
            element.classList.remove('completed');
        } else if (status === 'completed') {
            element.classList.remove('active');
            element.classList.add('completed');
            element.querySelector('.step-icon').innerHTML = '✓';
        }
        
        // Update progress bar
        const progress = (step / steps.total) * 100;
        document.getElementById('progress').style.width = progress + '%';
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = 'Error: ' + message;
        errorDiv.style.display = 'block';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('success').style.display = 'none';
    }
    
    /**
     * Show success message
     */
    function showSuccess() {
        document.getElementById('success').style.display = 'block';
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('error').style.display = 'none';
    }
    
    /**
     * Build webhook URL
     */
    function getWebhookUrl() {
        const protocol = window.location.protocol;
        const host = window.location.host;
        const basePath = window.location.pathname.replace(/\/install\/.*$/, '');
        return protocol + '//' + host + basePath + config.webhookPath;
    }
    
    /**
     * Start installation process
     */
    function startInstallation() {
        console.log('Starting installation with params:', params);
        
        updateProgress(1, 'active');
        
        BX24.init(function() {
            console.log('BX24 initialized');
            
            // Check for existing handlers and clean them up
            checkExistingHandlers();
        });
    }
    
    /**
     * Check and remove existing event handlers
     */
    function checkExistingHandlers() {
        updateProgress(1, 'completed');
        updateProgress(2, 'active');
        
        BX24.callMethod('event.get', {}, function(result) {
            if (result.error()) {
                console.error('Error getting events:', result.error());
                registerEventHandlers();
                return;
            }
            
            const existingEvents = result.data() || [];
            console.log('Found existing events:', existingEvents.length);
            
            if (existingEvents.length > 0) {
                removeOldHandlers(existingEvents);
            } else {
                registerEventHandlers();
            }
        });
    }
    
    /**
     * Remove old event handlers
     */
    function removeOldHandlers(events) {
        const webhookUrl = getWebhookUrl();
        const commands = {};
        let commandCount = 0;
        
        events.forEach(function(event, index) {
            // Only remove handlers that point to our webhook
            if (event.handler && 
                (event.handler.indexOf(webhookUrl) !== -1 || 
                 event.handler.indexOf('webhook.php') !== -1 ||
                 event.handler.indexOf('/api/bitrix/') !== -1)) {
                
                // Only remove ONAPPINSTALL and ONAPPUNINSTALL
                if (event.event === 'ONAPPINSTALL' || event.event === 'ONAPPUNINSTALL') {
                    commands['unbind_' + commandCount] = [
                        'event.unbind',
                        {
                            event: event.event,
                            handler: event.handler
                        }
                    ];
                    commandCount++;
                }
            }
        });
        
        if (commandCount > 0) {
            console.log('Removing old handlers:', commandCount);
            
            BX24.callBatch(commands, function(result) {
                console.log('Old handlers removed');
                registerEventHandlers();
            });
        } else {
            registerEventHandlers();
        }
    }
    
    /**
     * Register event handlers
     */
    function registerEventHandlers() {
        updateProgress(2, 'completed');
        updateProgress(3, 'active');
        
        const webhookUrl = getWebhookUrl();
        console.log('Webhook URL:', webhookUrl);
        
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
                showError('Failed to register event handlers');
                return;
            }
            
            // Check for errors in batch results
            let hasError = false;
            for (let key in result) {
                if (result[key] && result[key].error && result[key].error()) {
                    console.error('Error in ' + key + ':', result[key].error());
                    hasError = true;
                }
            }
            
            if (hasError) {
                showError('Some event handlers failed to register');
                // return;
            }
            
            console.log('Event handlers registered successfully');
            updateProgress(3, 'completed');
            
            // Call installation webhook
            callInstallationWebhook();
        });
    }
    
    /**
     * Call the installation webhook
     */
    function callInstallationWebhook() {
        updateProgress(4, 'active');
        
        const webhookUrl = getWebhookUrl();
        
        // Prepare installation data
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
        
        console.log('Sending installation data to webhook');
        
        // Send installation data to our webhook
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
                throw new Error(data.message || 'Installation failed');
            }
            
            console.log('Installation webhook completed:', data);
            updateProgress(4, 'completed');
            
            // Finish installation
            finishInstallation();
        })
        .catch(error => {
            console.error('Webhook error:', error);
            
            // Even if webhook fails, we should finish Bitrix24 installation
            // The app can handle missing data later
            finishInstallation();
        });
    }
    
    /**
     * Finish installation
     */
    function finishInstallation() {
        console.log('Finishing installation');
        
        // Show success message
        showSuccess();
        
        // Update status text
        document.querySelector('.status').textContent = 'Installation completed successfully!';
        
        // Call Bitrix24 installation finish
        setTimeout(function() {
            BX24.installFinish();
        console.log('Finishing installation setTimeout');

        }, 1000);
    }
    
    /**
     * Handle installation error
     */
    function handleError(error) {
        console.error('Installation error:', error);
        showError(error.message || 'Installation failed. Please try again.');
    }
    
    // Start installation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInstallation);
    } else {
        startInstallation();
    }
    
})();