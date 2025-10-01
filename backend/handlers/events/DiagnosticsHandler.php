<?php

namespace Handlers\Events;

use Handlers\BaseHandler;
use Core\Logger;
use Exception;

/**
 * Handler for diagnostics operations
 * Provides comprehensive system analysis
 */
class DiagnosticsHandler extends BaseHandler
{
    /**
     * Handle diagnostics request
     */
    public function handle(): array
    {
        try {
            // Get diagnostic type from request
            $type = $this->getEventData()['type'] ?? 'full';
            
            switch ($type) {
                case 'full':
                    return $this->getFullDiagnostics();
                    
                case 'handlers':
                    return $this->getHandlersDiagnostics();
                    
                case 'fields':
                    return $this->getFieldsDiagnostics();
                    
                case 'storage':
                    return $this->getStorageDiagnostics();
                    
                case 'permissions':
                    return $this->getPermissionsDiagnostics();
                    
                case 'performance':
                    return $this->getPerformanceDiagnostics();
                    
                case 'maintenance':
                    return $this->performMaintenance();
                    
                default:
                    return [
                        'error' => true,
                        'message' => 'Unknown diagnostic type: ' . $type,
                        'code' => 400
                    ];
            }
            
        } catch (Exception $e) {
            $this->logger->error('Diagnostics failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => true,
                'message' => 'Diagnostics failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Get full system diagnostics
     */
    private function getFullDiagnostics(): array
    {
        $diagnostics = [
            'timestamp' => date('Y-m-d H:i:s'),
            'domain' => $this->domain,
            'portal' => $this->getPortalDiagnostics(),
            'handlers' => $this->getHandlersInfo(),
            'fields' => $this->getFieldsInfo(),
            'storage' => $this->getStorageInfo(),
            'permissions' => $this->getPermissionsInfo(),
            'database' => $this->getDatabaseInfo(),
            'logs' => $this->getLogsInfo(),
            'performance' => $this->getPerformanceInfo(),
            'system' => $this->getSystemInfo()
        ];
        
        $this->logger->info('Full diagnostics generated', [
            'domain' => $this->domain,
            'sections' => array_keys($diagnostics)
        ]);
        
        return [
            'success' => true,
            'message' => 'Full diagnostics completed',
            'data' => $diagnostics
        ];
    }
    
    /**
     * Get portal diagnostics
     */
    private function getPortalDiagnostics(): array
    {
        if (!$this->portal) {
            return ['error' => 'Portal not found'];
        }
        
        $licenseStatus = $this->db->checkLicenseStatus($this->domain);
        
        return [
            'id' => $this->portal['id'],
            'domain' => $this->portal['domain'],
            'member_id' => $this->portal['member_id'],
            'status' => [
                'is_active' => (bool)$this->portal['is_active'],
                'is_blocked' => (bool)$this->portal['is_blocked'],
                'block_reason' => $this->portal['block_reason'] ?? null
            ],
            'license' => [
                'status' => $licenseStatus['status'],
                'is_valid' => $licenseStatus['is_valid'],
                'is_trial' => (bool)$this->portal['is_trial'],
                'trial_used' => (bool)$this->portal['trial_used'],
                'trial_end_date' => $this->portal['trial_end_date'],
                'has_license' => !empty($this->portal['license_key']),
                'license_valid_until' => $this->portal['license_valid_until'],
                'days_remaining' => $licenseStatus['days_remaining'] ?? 0
            ],
            'installation' => [
                'installed_at' => $this->portal['installed_at'] ?? $this->portal['created_at'],
                'installed_by' => $this->portal['installed_by'] ?? null,
                'reinstall_count' => $this->portal['reinstall_count'] ?? 0,
                'uninstalled_at' => $this->portal['uninstalled_at'] ?? null,
                'last_updated' => $this->portal['updated_at']
            ]
        ];
    }
    
    /**
     * Get event handlers diagnostics
     */
    private function getHandlersDiagnostics(): array
    {
        $handlers = $this->getHandlersInfo();
        
        return [
            'success' => true,
            'message' => 'Handlers diagnostics completed',
            'data' => [
                'handlers' => $handlers,
                'summary' => [
                    'total_handlers' => count($handlers['event_handlers'] ?? []),
                    'total_placements' => count($handlers['placements'] ?? []),
                    'webhook_url' => $handlers['webhook_url'] ?? null
                ]
            ]
        ];
    }
    
    /**
     * Get event handlers information
     */
    private function getHandlersInfo(): array
    {
        $info = [
            'event_handlers' => [],
            'placements' => [],
            'webhook_url' => $this->getWebhookUrl()
        ];
        
        // Get event handlers
        $handlersResult = $this->callBitrixMethod('event.get');
        if (isset($handlersResult['result'])) {
            $ourWebhookUrl = $this->getWebhookUrl();
            
            foreach ($handlersResult['result'] as $handler) {
                // Check if this is our handler
                $isOurs = (strpos($handler['handler'] ?? '', $ourWebhookUrl) !== false) ||
                         (strpos($handler['handler'] ?? '', 'webhook.php') !== false);
                
                $info['event_handlers'][] = [
                    'event' => $handler['event'],
                    'handler' => $handler['handler'],
                    'auth_type' => $handler['auth_type'] ?? 0,
                    'is_ours' => $isOurs
                ];
            }
        }
        
        // Get placements
        $placementsResult = $this->callBitrixMethod('placement.get');
        if (isset($placementsResult['result'])) {
            $info['placements'] = $placementsResult['result'];
        }
        
        return $info;
    }
    
    /**
     * Get user fields diagnostics
     */
    private function getFieldsDiagnostics(): array
    {
        $fields = $this->getFieldsInfo();
        
        return [
            'success' => true,
            'message' => 'Fields diagnostics completed',
            'data' => [
                'fields' => $fields,
                'summary' => [
                    'total_fields' => count($fields),
                    'by_entity' => $this->groupFieldsByEntity($fields)
                ]
            ]
        ];
    }
    
    /**
     * Get user fields information
     */
    private function getFieldsInfo(): array
    {
        $fields = [];
        
        // Get CRM user fields
        $entities = ['CRM_CONTACT', 'CRM_COMPANY', 'CRM_DEAL', 'CRM_LEAD'];
        
        foreach ($entities as $entity) {
            $result = $this->callBitrixMethod('crm.userfield.list', [
                'filter' => ['ENTITY_ID' => $entity]
            ]);
            
            if (isset($result['result'])) {
                foreach ($result['result'] as $field) {
                    $fields[] = [
                        'id' => $field['ID'],
                        'entity' => $field['ENTITY_ID'],
                        'field_name' => $field['FIELD_NAME'],
                        'type' => $field['USER_TYPE_ID'],
                        'label' => $field['EDIT_FORM_LABEL'] ?? $field['FIELD_NAME'],
                        'required' => $field['MANDATORY'] === 'Y',
                        'multiple' => $field['MULTIPLE'] === 'Y',
                        'settings' => $field['SETTINGS'] ?? []
                    ];
                }
            }
        }
        
        return $fields;
    }
    
    /**
     * Group fields by entity
     */
    private function groupFieldsByEntity(array $fields): array
    {
        $grouped = [];
        
        foreach ($fields as $field) {
            $entity = $field['entity'] ?? 'UNKNOWN';
            if (!isset($grouped[$entity])) {
                $grouped[$entity] = 0;
            }
            $grouped[$entity]++;
        }
        
        return $grouped;
    }
    
    /**
     * Get storage diagnostics
     */
    private function getStorageDiagnostics(): array
    {
        $storage = $this->getStorageInfo();
        
        return [
            'success' => true,
            'message' => 'Storage diagnostics completed',
            'data' => $storage
        ];
    }
    
    /**
     * Get storage information
     */
    private function getStorageInfo(): array
    {
        $info = [
            'database' => [],
            'entity_storage' => [],
            'app_options' => [],
            'user_options' => []
        ];
        
        // Database storage
        if ($this->db) {
            $info['database'] = $this->db->getDiagnostics();
        }
        
        // Entity storage
        $entityResult = $this->callBitrixMethod('entity.get');
        if (isset($entityResult['result'])) {
            foreach ($entityResult['result'] as $entity) {
                $itemsResult = $this->callBitrixMethod('entity.item.get', [
                    'ENTITY' => $entity['ENTITY']
                ]);
                
                $info['entity_storage'][] = [
                    'entity' => $entity['ENTITY'],
                    'name' => $entity['NAME'] ?? $entity['ENTITY'],
                    'items_count' => isset($itemsResult['result']) ? count($itemsResult['result']) : 0
                ];
            }
        }
        
        // App options
        $appOptionsResult = $this->callBitrixMethod('app.option.get');
        if (isset($appOptionsResult['result'])) {
            $info['app_options'] = $appOptionsResult['result'];
        }
        
        // User options  
        $userOptionsResult = $this->callBitrixMethod('user.option.get');
        if (isset($userOptionsResult['result'])) {
            $info['user_options'] = $userOptionsResult['result'];
        }
        
        return $info;
    }
    
    /**
     * Get permissions diagnostics
     */
    private function getPermissionsDiagnostics(): array
    {
        $permissions = $this->getPermissionsInfo();
        
        return [
            'success' => true,
            'message' => 'Permissions diagnostics completed',
            'data' => $permissions
        ];
    }
    
    /**
     * Get permissions information
     */
    private function getPermissionsInfo(): array
    {
        $info = [
            'scope' => [],
            'available_methods' => [],
            'user_permissions' => []
        ];
        
        // Get scope
        $scopeResult = $this->callBitrixMethod('scope');
        if (isset($scopeResult['result'])) {
            $info['scope'] = $scopeResult['result'];
        }
        
        // Get available methods for each scope
        foreach ($info['scope'] as $scope) {
            $methodsResult = $this->callBitrixMethod('methods', ['scope' => $scope]);
            if (isset($methodsResult['result'])) {
                $info['available_methods'][$scope] = count($methodsResult['result']);
            }
        }
        
        // Get current user permissions
        $user = $this->getCurrentUser();
        if ($user) {
            $info['user_permissions'] = [
                'is_admin' => $user['ADMIN'] ?? false,
                'is_integrator' => $user['IS_INTEGRATOR'] ?? false,
                'user_id' => $user['ID'] ?? null
            ];
        }
        
        return $info;
    }
    
    /**
     * Get database information
     */
    private function getDatabaseInfo(): array
    {
        if (!$this->db) {
            return ['error' => 'Database not available'];
        }
        
        $diagnostics = $this->db->getDiagnostics();
        
        // Add portal-specific stats
        if ($this->portal) {
            $settings = $this->db->getSettings($this->portal['id']);
            $diagnostics['portal_settings_count'] = count($settings);
        }
        
        return $diagnostics;
    }
    
    /**
     * Get logs information
     */
    private function getLogsInfo(): array
    {
        $info = [
            'statistics' => Logger::getLogStatistics($this->domain),
            'recent_errors' => []
        ];
        
        // Get recent errors
        $recentLogs = Logger::getRecentLogs($this->domain, 20, 'error');
        
        foreach ($recentLogs as $log) {
            $info['recent_errors'][] = [
                'timestamp' => $log['created_at'],
                'channel' => $log['channel'],
                'message' => $log['message'],
                'context' => json_decode($log['context'], true)
            ];
        }
        
        return $info;
    }
    
    /**
     * Get performance diagnostics
     */
    private function getPerformanceDiagnostics(): array
    {
        $performance = $this->getPerformanceInfo();
        
        return [
            'success' => true,
            'message' => 'Performance diagnostics completed',
            'data' => $performance
        ];
    }
    
    /**
     * Get performance information
     */
    private function getPerformanceInfo(): array
    {
        $startTime = $_SERVER['REQUEST_TIME_FLOAT'] ?? microtime(true);
        
        return [
            'execution_time' => round(microtime(true) - $startTime, 3),
            'memory' => [
                'current' => $this->formatBytes(memory_get_usage(true)),
                'peak' => $this->formatBytes(memory_get_peak_usage(true)),
                'limit' => ini_get('memory_limit')
            ],
            'database' => [
                'queries_count' => 0, // Would need query counting implementation
                'connection_time' => 0 // Would need timing implementation
            ],
            'api_calls' => [
                'total' => 0, // Would need counting implementation
                'failed' => 0
            ]
        ];
    }
    
    /**
     * Get system information
     */
    private function getSystemInfo(): array
    {
        return [
            'php' => [
                'version' => PHP_VERSION,
                'sapi' => php_sapi_name(),
                'extensions' => get_loaded_extensions()
            ],
            'server' => [
                'software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'protocol' => $_SERVER['SERVER_PROTOCOL'] ?? 'Unknown',
                'request_time' => date('Y-m-d H:i:s', $_SERVER['REQUEST_TIME'] ?? time())
            ],
            'application' => [
                'version' => $this->config['app']['version'] ?? '1.0.0',
                'environment' => $_ENV['APP_ENV'] ?? 'production',
                'debug' => $this->config['app']['debug'] ?? false
            ]
        ];
    }
    
    /**
     * Perform system maintenance
     */
    private function performMaintenance(): array
    {
        try {
            $results = [];
            
            // Clean old logs
            if ($this->db) {
                $results['database'] = $this->db->performMaintenance(30);
            }
            
            // Clean temporary files
            $results['temp_files'] = $this->cleanTempFiles();
            
            $this->logger->info('Maintenance performed', [
                'domain' => $this->domain,
                'results' => $results
            ]);
            
            return [
                'success' => true,
                'message' => 'Maintenance completed',
                'data' => $results
            ];
            
        } catch (Exception $e) {
            return [
                'error' => true,
                'message' => 'Maintenance failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Clean temporary files
     */
    private function cleanTempFiles(): array
    {
        $results = [
            'files_deleted' => 0,
            'space_freed' => 0
        ];
        
        $tempPath = STORAGE_PATH . '/temp';
        if (!is_dir($tempPath)) {
            return $results;
        }
        
        $files = glob($tempPath . '/*');
        $cutoffTime = time() - (24 * 60 * 60); // 24 hours ago
        
        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < $cutoffTime) {
                $size = filesize($file);
                if (unlink($file)) {
                    $results['files_deleted']++;
                    $results['space_freed'] += $size;
                }
            }
        }
        
        $results['space_freed'] = $this->formatBytes($results['space_freed']);
        
        return $results;
    }
    
    /**
     * Get webhook URL
     */
    private function getWebhookUrl(): string
    {
        $appUrl = $this->config['app']['url'] ?? '';
        
        if (empty($appUrl)) {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $appUrl = "$protocol://$host";
        }
        
        return rtrim($appUrl, '/') . $this->config['webhook']['endpoint'];
    }
    
    /**
     * Format bytes to human readable
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }


        
    /**
     * Manually sync webhooks (for diagnostics/maintenance)
     */
    private function syncWebhooksManually(): array
    {
        try {
            $webhookManager = new \Bitrix\WebhookManager($this->domain);
            $result = $webhookManager->syncWebhooks();
            
            return [
                'success' => true,
                'message' => 'Webhook synchronization completed',
                'data' => $result
            ];
            
        } catch (Exception $e) {
            return [
                'error' => true,
                'message' => 'Webhook synchronization failed',
                'details' => $e->getMessage()
            ];
        }
    }
}