<?php

namespace Bitrix;

use Core\Database;
use Core\Logger;
use Exception;

/**
 * Centralized webhook management
 * Handles registration, unregistration, and tracking of webhooks
 */
class WebhookManager
{
    private Database $db;
    private Logger $logger;
    private string $domain;
    private ?array $portal = null;
    
    public function __construct(string $domain)
    {
        $this->domain = $domain;
        $this->db = Database::getInstance();
        $this->logger = new Logger('webhooks');
        $this->portal = $this->db->getPortal($domain);
        
        // Set domain for CRest
        CRest::setDomain($domain);
    }
    
    /**
     * Get all registered webhooks for the portal
     */
    public function getRegisteredWebhooks(): array
    {
        try {
            $result = CRest::call('event.get');
            
            if (isset($result['error'])) {
                $this->logger->error('Failed to get webhooks', [
                    'domain' => $this->domain,
                    'error' => $result['error']
                ]);
                return [];
            }
            
            $webhooks = $result['result'] ?? [];
            $ourWebhookUrl = $this->getWebhookUrl();
            $ourWebhooks = [];
            
            foreach ($webhooks as $webhook) {
                // Check if this is our webhook
                if (isset($webhook['handler']) && 
                    (strpos($webhook['handler'], $ourWebhookUrl) !== false || 
                     strpos($webhook['handler'], 'webhook.php') !== false)) {
                    $ourWebhooks[] = $webhook;
                }
            }
            
            return $ourWebhooks;
            
        } catch (Exception $e) {
            $this->logger->error('Exception getting webhooks', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
    
    /**
     * Unregister all webhooks for expired/blocked portal
     */
    public function unregisterAllWebhooks(string $reason = 'License expired'): bool
    {
        try {
            $this->logger->info('Starting webhook unregistration', [
                'domain' => $this->domain,
                'reason' => $reason
            ]);
            
            // Get all our webhooks
            $webhooks = $this->getRegisteredWebhooks();
            
            if (empty($webhooks)) {
                $this->logger->info('No webhooks to unregister', [
                    'domain' => $this->domain
                ]);
                return true;
            }
            
            // Save webhooks to database for potential restoration
            $this->saveWebhooksForRestore($webhooks);
            
            // Prepare batch commands for unregistration
            $commands = [];
            foreach ($webhooks as $index => $webhook) {
                $commands["unbind_$index"] = [
                    'method' => 'event.unbind',
                    'params' => [
                        'event' => $webhook['event'],
                        'handler' => $webhook['handler'],
                        'auth_type' => $webhook['auth_type'] ?? 0
                    ]
                ];
            }
            
            // Execute batch unregistration
            if (!empty($commands)) {
                $result = CRest::callBatch($commands, 0);
                
                $unregistered = 0;
                $failed = 0;
                
                if (isset($result['result'])) {
                    foreach ($result['result'] as $key => $res) {
                        if (isset($res['error'])) {
                            $failed++;
                            $this->logger->warning('Failed to unregister webhook', [
                                'key' => $key,
                                'error' => $res['error_description'] ?? $res['error']
                            ]);
                        } else {
                            $unregistered++;
                        }
                    }
                } else {
                    $this->logger->error('Batch unregistration failed', [
                        'domain' => $this->domain,
                        'error' => $result['error'] ?? 'Unknown error'
                    ]);
                    return false;
                }
                
                $this->logger->info('Webhooks unregistration completed', [
                    'domain' => $this->domain,
                    'total' => count($webhooks),
                    'unregistered' => $unregistered,
                    'failed' => $failed,
                    'reason' => $reason
                ]);
                
                // Mark in database that webhooks were unregistered
                $this->markWebhooksUnregistered($reason);
                
                return $failed === 0;
            }
            
            return true;
            
        } catch (Exception $e) {
            $this->logger->error('Exception during webhook unregistration', [
                'domain' => $this->domain,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
    
    /**
     * Re-register webhooks after license activation
     */
    public function reregisterWebhooks(): bool
    {
        try {
            $this->logger->info('Starting webhook re-registration', [
                'domain' => $this->domain
            ]);
            
            // Get saved webhooks from database
            $savedWebhooks = $this->getSavedWebhooks();
            
            if (empty($savedWebhooks)) {
                // No saved webhooks, register default ones
                return $this->registerDefaultWebhooks();
            }
            
            // Prepare batch commands for registration
            $commands = [];
            foreach ($savedWebhooks as $index => $webhook) {
                $commands["bind_$index"] = [
                    'method' => 'event.bind',
                    'params' => [
                        'event' => $webhook['event'],
                        'handler' => $webhook['handler'],
                        'auth_type' => $webhook['auth_type'] ?? 0
                    ]
                ];
            }
            
            // Execute batch registration
            if (!empty($commands)) {
                $result = CRest::callBatch($commands, 0);
                
                $registered = 0;
                $failed = 0;
                
                if (isset($result['result'])) {
                    foreach ($result['result'] as $key => $res) {
                        if (isset($res['error'])) {
                            $failed++;
                            $this->logger->warning('Failed to re-register webhook', [
                                'key' => $key,
                                'error' => $res['error_description'] ?? $res['error']
                            ]);
                        } else {
                            $registered++;
                        }
                    }
                }
                
                $this->logger->info('Webhooks re-registration completed', [
                    'domain' => $this->domain,
                    'registered' => $registered,
                    'failed' => $failed
                ]);
                
                // Clear webhooks unregistered flag
                $this->markWebhooksRegistered();
                
                return $failed === 0;
            }
            
            return true;
            
        } catch (Exception $e) {
            $this->logger->error('Exception during webhook re-registration', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Register default webhooks from config
     */
    public function registerDefaultWebhooks(): bool
    {
        $config = require CONFIG_PATH . '/app.php';
        $allowedEvents = $config['webhook']['allowed_events'] ?? [];
        $webhookUrl = $this->getWebhookUrl();
        
        if (empty($allowedEvents)) {
            return true;
        }
        
        $commands = [];
        foreach ($allowedEvents as $event) {
            // Skip application lifecycle events (they're handled separately)
            if (in_array($event, ['ONAPPINSTALL', 'ONAPPUNINSTALL', 'ONAPPUPDATE'])) {
                continue;
            }
            
            $commands["reg_$event"] = [
                'method' => 'event.bind',
                'params' => [
                    'event' => $event,
                    'handler' => $webhookUrl,
                    'auth_type' => 0
                ]
            ];
        }
        
        if (!empty($commands)) {
            $result = CRest::callBatch($commands, 0);
            
            $this->logger->info('Default webhooks registered', [
                'domain' => $this->domain,
                'count' => count($commands)
            ]);
            
            return !isset($result['error']);
        }
        
        return true;
    }
    
    /**
     * Check if webhooks should be unregistered
     */
    public function shouldUnregisterWebhooks(): bool
    {
        if (!$this->portal) {
            return false;
        }
        
        // Check if already unregistered
        $settings = $this->db->getSettings($this->portal['id'], 'webhooks_unregistered');
        if (!empty($settings['webhooks_unregistered']) && $settings['webhooks_unregistered'] === '1') {
            return false; // Already unregistered
        }
        
        // Check license status
        $licenseStatus = $this->db->checkLicenseStatus($this->domain);
        
        // Should unregister if license is not valid and webhooks are still registered
        return !$licenseStatus['is_valid'];
    }
    
    /**
     * Save webhooks configuration for potential restore
     */
    private function saveWebhooksForRestore(array $webhooks): void
    {
        if (!$this->portal) {
            return;
        }
        
        $this->db->saveSetting(
            $this->portal['id'],
            'saved_webhooks',
            json_encode($webhooks)
        );
        
        $this->db->saveSetting(
            $this->portal['id'],
            'webhooks_saved_at',
            date('Y-m-d H:i:s')
        );
    }
    
    /**
     * Get saved webhooks configuration
     */
    private function getSavedWebhooks(): array
    {
        if (!$this->portal) {
            return [];
        }
        
        $settings = $this->db->getSettings($this->portal['id'], 'saved_webhooks');
        
        if (!empty($settings['saved_webhooks'])) {
            $webhooks = json_decode($settings['saved_webhooks'], true);
            return is_array($webhooks) ? $webhooks : [];
        }
        
        return [];
    }
    
    /**
     * Mark webhooks as unregistered in database
     */
    private function markWebhooksUnregistered(string $reason): void
    {
        if (!$this->portal) {
            return;
        }
        
        $this->db->saveSetting($this->portal['id'], 'webhooks_unregistered', '1');
        $this->db->saveSetting($this->portal['id'], 'webhooks_unregistered_at', date('Y-m-d H:i:s'));
        $this->db->saveSetting($this->portal['id'], 'webhooks_unregistered_reason', $reason);
    }
    
    /**
     * Mark webhooks as registered (clear unregistered flag)
     */
    private function markWebhooksRegistered(): void
    {
        if (!$this->portal) {
            return;
        }
        
        $this->db->saveSetting($this->portal['id'], 'webhooks_unregistered', '0');
        $this->db->saveSetting($this->portal['id'], 'webhooks_registered_at', date('Y-m-d H:i:s'));
    }
    
    /**
     * Get webhook URL from config
     */
    private function getWebhookUrl(): string
    {
        $config = require CONFIG_PATH . '/app.php';
        $appUrl = $config['app']['url'] ?? '';
        
        if (empty($appUrl)) {
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
            $appUrl = "$protocol://$host";
        }
        
        return rtrim($appUrl, '/') . $config['webhook']['endpoint'];
    }
    
    /**
     * Check and unregister webhooks if needed (for cron)
     */
    public static function checkAndUnregisterExpiredPortals(): array
    {
        $db = Database::getInstance();
        $logger = new Logger('webhook-cleanup');
        $results = [
            'checked' => 0,
            'unregistered' => 0,
            'failed' => 0
        ];
        
        try {
            // Get all active portals
            $conn = $db->getConnection();
            $config = require CONFIG_PATH . '/database.php';
            $prefix = $config['prefix'] ?? 'app_';
            
            $stmt = $conn->query(
                "SELECT domain FROM {$prefix}portals 
                 WHERE is_active = 1"
            );
            
            $portals = $stmt->fetchAll();
            
            foreach ($portals as $portal) {
                $results['checked']++;
                
                $manager = new self($portal['domain']);
                
                if ($manager->shouldUnregisterWebhooks()) {
                    $logger->info('Unregistering webhooks for expired portal', [
                        'domain' => $portal['domain']
                    ]);
                    
                    if ($manager->unregisterAllWebhooks('Automated cleanup - license expired')) {
                        $results['unregistered']++;
                    } else {
                        $results['failed']++;
                    }
                }
            }
            
            $logger->info('Webhook cleanup completed', $results);
            
        } catch (Exception $e) {
            $logger->error('Webhook cleanup failed', [
                'error' => $e->getMessage()
            ]);
        }
        
        return $results;
    }


    /**
     * Інтелектуальна синхронізація вебхуків
     * Порівнює існуючі вебхуки з конфігурацією та синхронізує їх
     * 
     * @return array Результат синхронізації
     */
    public function syncWebhooks(): array
    {
        try {
            $this->logger->info('Starting intelligent webhook synchronization', [
                'domain' => $this->domain
            ]);
            
            // 1. Отримати конфігурацію дозволених подій
            $config = require CONFIG_PATH . '/app.php';
            $allowedEvents = $config['webhook']['allowed_events'] ?? [];
            $webhookUrl = $this->getWebhookUrl();
            
            // Виключити системні події (вони реєструються окремо)
            $systemEvents = ['ONAPPINSTALL', 'ONAPPUNINSTALL', 'ONAPPUPDATE'];
            $allowedEvents = array_diff($allowedEvents, $systemEvents);
            
            if (empty($allowedEvents)) {
                $this->logger->info('No events to sync (empty configuration)');
                return [
                    'success' => true,
                    'added' => [],
                    'removed' => [],
                    'kept' => [],
                    'errors' => []
                ];
            }
            
            // 2. Отримати всі існуючі вебхуки
            $existingWebhooks = $this->getAllWebhooks();
            
            // 3. Розділити вебхуки на наші та чужі
            $ourWebhooks = [];
            $otherWebhooks = [];
            
            foreach ($existingWebhooks as $webhook) {
                if ($this->isOurWebhook($webhook, $webhookUrl)) {
                    $ourWebhooks[$webhook['event']] = $webhook;
                } else {
                    $otherWebhooks[] = $webhook;
                }
            }
            
            // 4. Визначити що додати, видалити та залишити
            $toAdd = [];
            $toRemove = [];
            $toKeep = [];
            
            // Перевірити які події потрібно додати
            foreach ($allowedEvents as $event) {
                if (!isset($ourWebhooks[$event])) {
                    $toAdd[] = $event;
                } else {
                    // Вебхук вже існує і URL співпадає - залишаємо
                    $toKeep[] = $event;
                }
            }
            
            // Перевірити які вебхуки потрібно видалити
            foreach ($ourWebhooks as $event => $webhook) {
                if (!in_array($event, $allowedEvents) && !in_array($event, $systemEvents)) {
                    // Ця подія більше не в конфігурації - видаляємо
                    $toRemove[] = $webhook;
                }
            }
            
            $this->logger->info('Webhook sync analysis completed', [
                'to_add' => count($toAdd),
                'to_remove' => count($toRemove),
                'to_keep' => count($toKeep),
                'other_webhooks' => count($otherWebhooks)
            ]);
            
            // 5. Виконати синхронізацію
            $results = [
                'success' => true,
                'added' => [],
                'removed' => [],
                'kept' => $toKeep,
                'errors' => []
            ];
            
            // Видалити зайві вебхуки
            if (!empty($toRemove)) {
                $removeResults = $this->removeWebhooks($toRemove);
                $results['removed'] = $removeResults['removed'];
                $results['errors'] = array_merge($results['errors'], $removeResults['errors']);
            }
            
            // Додати нові вебхуки
            if (!empty($toAdd)) {
                $addResults = $this->addWebhooks($toAdd, $webhookUrl);
                $results['added'] = $addResults['added'];
                $results['errors'] = array_merge($results['errors'], $addResults['errors']);
            }
            
            // Визначити успішність операції
            $results['success'] = empty($results['errors']);
            
            $this->logger->info('Webhook synchronization completed', [
                'added' => count($results['added']),
                'removed' => count($results['removed']),
                'kept' => count($results['kept']),
                'errors' => count($results['errors'])
            ]);
            
            return $results;
            
        } catch (Exception $e) {
            $this->logger->error('Webhook synchronization failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'added' => [],
                'removed' => [],
                'kept' => [],
                'errors' => [$e->getMessage()]
            ];
        }
    }

    /**
     * Отримати всі вебхуки (не тільки наші)
     */
    private function getAllWebhooks(): array
    {
        try {
            $result = CRest::call('event.get');
            
            if (isset($result['error'])) {
                $this->logger->error('Failed to get all webhooks', [
                    'domain' => $this->domain,
                    'error' => $result['error']
                ]);
                return [];
            }
            
            return $result['result'] ?? [];
            
        } catch (Exception $e) {
            $this->logger->error('Exception getting all webhooks', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Перевірити чи це наш вебхук
     */
    private function isOurWebhook(array $webhook, string $ourUrl): bool
    {
        if (!isset($webhook['handler'])) {
            return false;
        }
        
        $handler = $webhook['handler'];
        
        // Точне співпадіння URL
        if ($handler === $ourUrl) {
            return true;
        }
        
        // Перевірка на наявність webhook.php (старі версії)
        if (strpos($handler, 'webhook.php') !== false) {
            // Додаткова перевірка домену
            $parsedHandler = parse_url($handler);
            $parsedOur = parse_url($ourUrl);
            
            if ($parsedHandler && $parsedOur) {
                // Якщо домени співпадають - вважаємо це нашим вебхуком
                if ($parsedHandler['host'] === $parsedOur['host']) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Видалити вебхуки
     */
    private function removeWebhooks(array $webhooks): array
    {
        $results = [
            'removed' => [],
            'errors' => []
        ];
        
        if (empty($webhooks)) {
            return $results;
        }
        
        // Підготувати batch команди
        $commands = [];
        foreach ($webhooks as $index => $webhook) {
            $commands["remove_$index"] = [
                'method' => 'event.unbind',
                'params' => [
                    'event' => $webhook['event'],
                    'handler' => $webhook['handler'],
                    'auth_type' => $webhook['auth_type'] ?? 0
                ]
            ];
        }
        
        // Виконати batch запит
        $batchResult = CRest::callBatch($commands, 0);
        
        if (isset($batchResult['result'])) {
            foreach ($batchResult['result'] as $key => $res) {
                $index = str_replace('remove_', '', $key);
                if (isset($res['error'])) {
                    $results['errors'][] = [
                        'event' => $webhooks[$index]['event'],
                        'error' => $res['error_description'] ?? $res['error']
                    ];
                } else {
                    $results['removed'][] = $webhooks[$index]['event'];
                }
            }
        }
        
        return $results;
    }

    /**
     * Додати нові вебхуки
     */
    private function addWebhooks(array $events, string $webhookUrl): array
    {
        $results = [
            'added' => [],
            'errors' => []
        ];
        
        if (empty($events)) {
            return $results;
        }
        
        // Підготувати batch команди
        $commands = [];
        foreach ($events as $index => $event) {
            $commands["add_$index"] = [
                'method' => 'event.bind',
                'params' => [
                    'event' => $event,
                    'handler' => $webhookUrl,
                    'auth_type' => 0
                ]
            ];
        }
        
        // Виконати batch запит
        $batchResult = CRest::callBatch($commands, 0);
        
        if (isset($batchResult['result'])) {
            foreach ($batchResult['result'] as $key => $res) {
                $index = str_replace('add_', '', $key);
                if (isset($res['error'])) {
                    // Ігнорувати помилку якщо вебхук вже існує
                    if ($res['error'] !== 'HANDLER_ALREADY_REGISTERED') {
                        $results['errors'][] = [
                            'event' => $events[$index],
                            'error' => $res['error_description'] ?? $res['error']
                        ];
                    } else {
                        // Вебхук вже зареєстровано - додаємо до успішних
                        $results['added'][] = $events[$index];
                    }
                } else {
                    $results['added'][] = $events[$index];
                }
            }
        }
        
        return $results;
    }

        
    // ============================================
    // АЛЬТЕРНАТИВНИЙ ВАРІАНТ для WebhookManager
    // Новий метод для повного видалення
    // ============================================

    /**
     * Unregister ALL webhooks (for complete uninstall)
     * Видаляє ВСІ вебхуки додатку, не тільки наші
     */
    public function unregisterAllWebhooksComplete(): bool
    {
        try {
            $this->logger->info('Starting complete webhook unregistration', [
                'domain' => $this->domain
            ]);
            
            // Get ALL webhooks without filtering
            $result = CRest::call('event.get');
            
            if (isset($result['error'])) {
                $this->logger->error('Failed to get webhooks for complete unregistration', [
                    'domain' => $this->domain,
                    'error' => $result['error']
                ]);
                return false;
            }
            
            $webhooks = $result['result'] ?? [];
            
            if (empty($webhooks)) {
                $this->logger->info('No webhooks to unregister');
                return true;
            }
            
            // Prepare batch commands for ALL webhooks
            $batches = array_chunk($webhooks, 50); // Batch по 50
            $totalUnregistered = 0;
            $totalFailed = 0;
            
            foreach ($batches as $batch) {
                $commands = [];
                
                foreach ($batch as $index => $webhook) {
                    $commands["unbind_$index"] = [
                        'method' => 'event.unbind',
                        'params' => [
                            'event' => $webhook['event'],
                            'handler' => $webhook['handler'],
                            'auth_type' => $webhook['auth_type'] ?? 0
                        ]
                    ];
                }
                
                // Execute batch
                $batchResult = CRest::callBatch($commands, 0);
                
                if (isset($batchResult['result'])) {
                    foreach ($batchResult['result'] as $res) {
                        if (isset($res['error']) && $res['error'] !== 'EVENT_NOT_FOUND') {
                            $totalFailed++;
                        } else {
                            $totalUnregistered++;
                        }
                    }
                }
            }
            
            $this->logger->info('Complete webhook unregistration finished', [
                'domain' => $this->domain,
                'total_webhooks' => count($webhooks),
                'unregistered' => $totalUnregistered,
                'failed' => $totalFailed
            ]);
            
            // Mark in database
            if ($this->portal) {
                $this->db->saveSetting($this->portal['id'], 'webhooks_completely_removed', '1');
                $this->db->saveSetting($this->portal['id'], 'webhooks_removed_at', date('Y-m-d H:i:s'));
            }
            
            return $totalFailed === 0;
            
        } catch (Exception $e) {
            $this->logger->error('Complete webhook unregistration failed', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}