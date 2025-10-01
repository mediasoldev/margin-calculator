<?php

namespace Core;

use PDO;
use PDOException;
use Exception;

/**
 * Database singleton class
 * Handles all database operations
 */
class Database
{
    private static ?Database $instance = null;
    private ?PDO $connection = null;
    private array $config = [];
    private Logger $logger;
    private string $tablePrefix = '';
    
    /**
     * Private constructor for singleton pattern
     */
    private function __construct(array $config)
    {
        $this->config = $config;
        $this->tablePrefix = $config['prefix'] ?? 'app_';
        $this->logger = new Logger('database');
    }

    /**
     * Get diagnostic information about database
     */
    public function getDiagnostics(): array
    {
        try {
            $diagnostics = [
                'connection' => $this->connection ? 'Connected' : 'Disconnected',
                'database' => $this->config['name'] ?? 'unknown',
                'host' => $this->config['host'] ?? 'unknown',
                'tables' => [],
                'statistics' => []
            ];
            
            if (!$this->connection) {
                return $diagnostics;
            }
            
            // Get table information
            $stmt = $this->connection->query(
                "SELECT 
                    table_name AS name,
                    table_rows AS rows,
                    round(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
                    table_comment AS comment
                FROM information_schema.TABLES 
                WHERE table_schema = DATABASE()
                AND table_name LIKE '{$this->tablePrefix}%'"
            );
            
            $diagnostics['tables'] = $stmt->fetchAll();
            
            // Get general statistics
            $tables = ['portals', 'settings', 'tokens', 'logs', 'cache'];
            foreach ($tables as $table) {
                $fullTableName = $this->tablePrefix . $table;
                try {
                    $stmt = $this->connection->query("SELECT COUNT(*) as count FROM {$fullTableName}");
                    $result = $stmt->fetch();
                    $diagnostics['statistics'][$table] = [
                        'total_records' => $result['count'] ?? 0
                    ];
                    
                    // Additional statistics for specific tables
                    if ($table === 'portals') {
                        $stmt = $this->connection->query(
                            "SELECT 
                                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active,
                                COUNT(CASE WHEN is_trial = 1 THEN 1 END) as trial,
                                COUNT(CASE WHEN license_key IS NOT NULL THEN 1 END) as licensed
                            FROM {$fullTableName}"
                        );
                        $stats = $stmt->fetch();
                        $diagnostics['statistics'][$table] = array_merge(
                            $diagnostics['statistics'][$table],
                            $stats
                        );
                    }
                    
                    if ($table === 'logs') {
                        $stmt = $this->connection->query(
                            "SELECT 
                                COUNT(CASE WHEN level = 'error' THEN 1 END) as errors,
                                COUNT(CASE WHEN level = 'warning' THEN 1 END) as warnings,
                                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as last_24h
                            FROM {$fullTableName}"
                        );
                        $stats = $stmt->fetch();
                        $diagnostics['statistics'][$table] = array_merge(
                            $diagnostics['statistics'][$table],
                            $stats
                        );
                    }
                    
                } catch (PDOException $e) {
                    $diagnostics['statistics'][$table] = ['error' => $e->getMessage()];
                }
            }
            
            return $diagnostics;
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to get diagnostics', [
                'error' => $e->getMessage()
            ]);
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Clean old logs and cache
     */
    public function performMaintenance(int $daysToKeepLogs = 30): array
    {
        $results = [
            'logs_deleted' => 0,
            'cache_deleted' => 0,
            'tokens_deleted' => 0
        ];
        
        try {
            // Clean old logs
            $stmt = $this->connection->prepare(
                "DELETE FROM {$this->tablePrefix}logs 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL :days DAY)"
            );
            $stmt->execute(['days' => $daysToKeepLogs]);
            $results['logs_deleted'] = $stmt->rowCount();
            
            // Clean expired cache
            $results['cache_deleted'] = $this->cleanExpiredCache();
            
            // Clean old token history (keep last 10 per portal)
            $stmt = $this->connection->query(
                "DELETE t1 FROM {$this->tablePrefix}tokens t1
                LEFT JOIN (
                    SELECT id, portal_id,
                    ROW_NUMBER() OVER (PARTITION BY portal_id ORDER BY created_at DESC) as rn
                    FROM {$this->tablePrefix}tokens
                ) t2 ON t1.id = t2.id
                WHERE t2.rn > 10"
            );
            $results['tokens_deleted'] = $stmt->rowCount();
            
            $this->logger->info('Maintenance performed', $results);
            
        } catch (PDOException $e) {
            $this->logger->error('Maintenance failed', [
                'error' => $e->getMessage()
            ]);
        }
        
        return $results;
    }
    
    /**
     * Get database instance
     */
    public static function getInstance(): ?Database
    {
        return self::$instance;
    }
    
    /**
     * Initialize database connection and create tables
     */
    public static function init(array $config): Database
    {
        if (self::$instance === null) {
            self::$instance = new self($config);
            self::$instance->connect();
            
            if ($config['auto_create_tables'] ?? true) {
                self::$instance->createTables();
            }
        }
        
        return self::$instance;
    }
    
    /**
     * Establish database connection
     */
    private function connect(): void
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                $this->config['host'],
                $this->config['port'] ?? 3306,
                $this->config['name'],
                $this->config['charset'] ?? 'utf8mb4'
            );
            
            $this->connection = new PDO(
                $dsn,
                $this->config['user'],
                $this->config['pass'],
                $this->config['options'] ?? []
            );
            
            $this->logger->info('Database connected successfully');
            
        } catch (PDOException $e) {
            $this->logger->error('Database connection failed', [
                'error' => $e->getMessage()
            ]);
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }
    
    /**
     * Create tables if they don't exist
     */
    private function createTables(): void
    {
        $queries = [
            // Main portals table - NEVER DELETE RECORDS!
            "CREATE TABLE IF NOT EXISTS {$this->tablePrefix}portals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                domain VARCHAR(255) UNIQUE NOT NULL,
                member_id VARCHAR(255) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                access_token TEXT,
                refresh_token TEXT,
                application_token VARCHAR(255),
                server_endpoint VARCHAR(255),
                client_endpoint VARCHAR(255),
                expires_at INT,
                
                -- License management
                is_trial TINYINT(1) DEFAULT 1,
                trial_used TINYINT(1) DEFAULT 0,
                trial_end_date TIMESTAMP NULL,
                license_key VARCHAR(255) NULL,
                license_valid_until TIMESTAMP NULL,
                license_activated_at TIMESTAMP NULL,
                license_activated_by INT NULL,
                
                -- Status tracking
                is_active TINYINT(1) DEFAULT 1,
                is_blocked TINYINT(1) DEFAULT 0,
                block_reason VARCHAR(255) NULL,
                
                -- Installation tracking
                installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                installed_by INT NULL,
                uninstalled_at TIMESTAMP NULL,
                uninstalled_by INT NULL,
                reinstall_count INT DEFAULT 0,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_domain (domain),
                INDEX idx_member (member_id),
                INDEX idx_expires (expires_at),
                INDEX idx_active (is_active),
                INDEX idx_license (license_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Portal settings table
            "CREATE TABLE IF NOT EXISTS {$this->tablePrefix}settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                portal_id INT NOT NULL,
                setting_key VARCHAR(100) NOT NULL,
                setting_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_portal_key (portal_id, setting_key),
                FOREIGN KEY (portal_id) REFERENCES {$this->tablePrefix}portals(id) ON DELETE CASCADE,
                INDEX idx_portal_id (portal_id),
                INDEX idx_setting_key (setting_key)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Token history table (for debugging)
            "CREATE TABLE IF NOT EXISTS {$this->tablePrefix}tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                portal_id INT NOT NULL,
                access_token TEXT,
                refresh_token TEXT,
                expires_at INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portal_id) REFERENCES {$this->tablePrefix}portals(id) ON DELETE CASCADE,
                INDEX idx_portal_id (portal_id),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Activity logs table
            "CREATE TABLE IF NOT EXISTS {$this->tablePrefix}logs (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                portal_id INT NULL,
                level VARCHAR(20) NOT NULL,
                channel VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                context JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (portal_id) REFERENCES {$this->tablePrefix}portals(id) ON DELETE CASCADE,
                INDEX idx_portal_id (portal_id),
                INDEX idx_level (level),
                INDEX idx_channel (channel),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
            
            // Cache table
            "CREATE TABLE IF NOT EXISTS {$this->tablePrefix}cache (
                cache_key VARCHAR(255) PRIMARY KEY,
                cache_value LONGTEXT,
                expires_at INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_expires (expires_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
        ];
        
        foreach ($queries as $query) {
            try {
                $this->connection->exec($query);
                $this->logger->debug('Table created or already exists', [
                    'query' => substr($query, 0, 100) . '...'
                ]);
            } catch (PDOException $e) {
                $this->logger->error('Failed to create table', [
                    'error' => $e->getMessage(),
                    'query' => substr($query, 0, 100) . '...'
                ]);
                throw new Exception('Failed to create table: ' . $e->getMessage());
            }
        }
        
        $this->logger->info('All tables created successfully');
    }
    
    /**
     * Get PDO connection
     */
    public function getConnection(): ?PDO
    {
        return $this->connection;
    }
    
    /**
     * Get portal by domain
     */
    public function getPortal(string $domain): ?array
    {       

        try {
            $stmt = $this->connection->prepare(
                "SELECT * FROM {$this->tablePrefix}portals WHERE domain = :domain"
            );

            $stmt->execute(['domain' => $domain]);
            
            $result = $stmt->fetch();
           
            return $result ?: null;
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to get portal', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Get portal by member_id
     */
    public function getPortalByMemberId(string $memberId): ?array
    {
        try {
            $stmt = $this->connection->prepare(
                "SELECT * FROM {$this->tablePrefix}portals WHERE member_id = :member_id"
            );
            $stmt->execute(['member_id' => $memberId]);
            
            return $stmt->fetch() ?: null;
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to get portal by member_id', [
                'member_id' => $memberId,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Save or update portal
     */
    public function savePortal(string $domain, array $data): bool
    {
        try {
            // Prepare data
            $fields = [
                'domain' => $domain,
                'member_id' => $data['member_id'] ?? null,
                'user_id' => $data['user_id'] ?? 0,
                'access_token' => $data['access_token'] ?? null,
                'refresh_token' => $data['refresh_token'] ?? null,
                'application_token' => $data['application_token'] ?? null,
                'server_endpoint' => $data['server_endpoint'] ?? null,
                'client_endpoint' => $data['client_endpoint'] ?? null,
                'expires_at' => isset($data['expires_at']) ? 
                    (is_numeric($data['expires_at']) && $data['expires_at'] > 2147483647 ? 
                        intval($data['expires_at'] / 1000) : // якщо мілісекунди, ділимо на 1000
                        intval($data['expires_at'])) : 
                    (time() + 3600),

                'is_active' => $data['is_active'] ?? 1,
                'reinstall_count' => $data['reinstall_count'] ?? 0,

                'is_trial' => $data['is_trial'] ?? 1,
                'trial_used' => $data['trial_used'] ?? 0,
                'trial_end_date' => $data['trial_end_date'] ?? date('Y-m-d H:i:s', strtotime('+14 days')),
                'installed_at' => $data['installed_at'] ?? date('Y-m-d H:i:s'),
                'installed_by' => $data['installed_by'] ?? $data['user_id'] ?? null
            ];

            if(isset($data['is_blocked'])){
                $fields['is_blocked'] = $data['is_blocked'];
            }

            if(isset($data['is_blocked']) && isset($authData['block_reason'])){
                $fields['block_reason'] = $data['block_reason'];
            }
            
            // Build INSERT ... ON DUPLICATE KEY UPDATE query
            $columns = array_keys($fields);
            $values = array_map(fn($col) => ":$col", $columns);
            $updates = array_map(fn($col) => "$col = VALUES($col)", $columns);
            
            $sql = sprintf(
                "INSERT INTO {$this->tablePrefix}portals (%s) VALUES (%s) 
                ON DUPLICATE KEY UPDATE %s, updated_at = CURRENT_TIMESTAMP",
                implode(', ', $columns),
                implode(', ', $values),
                implode(', ', $updates)
            );
            
            $stmt = $this->connection->prepare($sql);
            $result = $stmt->execute($fields);
            
            if ($result) {
                $this->logger->info('Portal saved successfully', ['domain' => $domain]);
                
                // Save token history
                $portalId = $this->connection->lastInsertId() ?: $this->getPortal($domain)['id'];
                if ($portalId) {
                    $this->saveTokenHistory($portalId, $fields);
                }
            }
            
            return $result;
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to save portal', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Update tokens for portal
     */
    public function updateTokens(string $domain, array $tokens): bool
    {
        try {
            $stmt = $this->connection->prepare(
                "UPDATE {$this->tablePrefix}portals 
                SET access_token = :access_token,
                    refresh_token = :refresh_token,
                    expires_at = :expires_at,
                    updated_at = CURRENT_TIMESTAMP
                WHERE domain = :domain"
            );
            
            $result = $stmt->execute([
                'access_token' => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'],
                'expires_at' => time() + ($tokens['expires_in'] ?? 3600),
                'domain' => $domain
            ]);
            
            if ($result) {
                $this->logger->info('Tokens updated successfully', ['domain' => $domain]);
                
                // Save token history
                $portal = $this->getPortal($domain);
                if ($portal) {
                    $this->saveTokenHistory($portal['id'], $tokens);
                }
            }
            
            return $result;
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to update tokens', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Save token history
     */
    private function saveTokenHistory(int $portalId, array $tokens): void
    {
        try {
            $stmt = $this->connection->prepare(
                "INSERT INTO {$this->tablePrefix}tokens 
                (portal_id, access_token, refresh_token, expires_at) 
                VALUES (:portal_id, :access_token, :refresh_token, :expires_at)"
            );
            
            $stmt->execute([
                'portal_id' => $portalId,
                'access_token' => $tokens['access_token'] ?? null,
                'refresh_token' => $tokens['refresh_token'] ?? null,
                'expires_at' => $tokens['expires_at'] ?? (time() + 3600)
            ]);
            
        } catch (PDOException $e) {
            // Log but don't throw - this is not critical
            $this->logger->warning('Failed to save token history', [
                'portal_id' => $portalId,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Deactivate portal (instead of deleting)
     * NEVER DELETE PORTAL RECORDS!
     */
    public function deactivatePortal(string $domain, ?int $userId = null): bool
    {
        try {
            $stmt = $this->connection->prepare(
                "UPDATE {$this->tablePrefix}portals 
                SET is_active = 0,
                    uninstalled_at = CURRENT_TIMESTAMP,
                    uninstalled_by = :user_id,
                    trial_used = CASE WHEN is_trial = 1 THEN 1 ELSE trial_used END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE domain = :domain"
            );
            
            $result = $stmt->execute([
                'domain' => $domain,
                'user_id' => $userId
            ]);
            
            if ($result && $stmt->rowCount() > 0) {
                $this->logger->info('Portal deactivated', [
                    'domain' => $domain,
                    'user_id' => $userId
                ]);
                return true;
            }
            
            $this->logger->warning('Portal not found for deactivation', ['domain' => $domain]);
            return false;
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to deactivate portal', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Check if portal can use trial
     */
    public function canUseTrial(string $memberId): bool
    {
        try {
            $stmt = $this->connection->prepare(
                "SELECT trial_used FROM {$this->tablePrefix}portals 
                WHERE member_id = :member_id"
            );
            $stmt->execute(['member_id' => $memberId]);
            
            $result = $stmt->fetch();
            
            // If portal doesn't exist or trial not used
            return !$result || !$result['trial_used'];
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to check trial status', [
                'member_id' => $memberId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

        
    /**
     * Activate license for a portal
     * UPDATED: Clear webhook unregistration and unblock portal
     */
    public function activateLicense(string $domain, string $licenseKey, ?string $validUntil = null, ?int $userId = null): bool
    {
        try {
            if ($validUntil === null) {
                $validUntil = date('Y-m-d H:i:s', strtotime('+1 year'));
            }
            
            $stmt = $this->connection->prepare(
                "UPDATE {$this->prefix}portals 
                SET license_key = ?,
                    license_valid_until = ?,
                    license_activated_at = CURRENT_TIMESTAMP,
                    license_activated_by = ?,
                    is_trial = 0,
                    is_blocked = 0,
                    block_reason = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE domain = ?"
            );
            
            $stmt->execute([$licenseKey, $validUntil, $userId, $domain]);
            
            if ($stmt->rowCount() > 0) {
                $this->logger->info('License activated', [
                    'domain' => $domain,
                    'valid_until' => $validUntil,
                    'activated_by' => $userId
                ]);
                
                // Clear webhook unregistration flag
                $portal = $this->getPortal($domain);
                if ($portal) {
                    $this->saveSetting($portal['id'], 'license_activated_at', date('Y-m-d H:i:s'));
                    $this->saveSetting($portal['id'], 'webhooks_unregistered', '0');
                }
                
                return true;
            }
            
            return false;
            
        } catch (\PDOException $e) {
            $this->logger->error('Failed to activate license', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get license statistics
     * NEW METHOD
     */
    public function getLicenseStatistics(): array
    {
        try {
            $stats = [];
            
            // Total portals
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as total FROM {$this->prefix}portals"
            );
            $stats['total_portals'] = $stmt->fetch()['total'];
            
            // Active portals
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as count FROM {$this->prefix}portals WHERE is_active = 1"
            );
            $stats['active_portals'] = $stmt->fetch()['count'];
            
            // Trial portals
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as count FROM {$this->prefix}portals 
                WHERE is_trial = 1 AND trial_end_date > NOW()"
            );
            $stats['active_trials'] = $stmt->fetch()['count'];
            
            // Expired trials
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as count FROM {$this->prefix}portals 
                WHERE is_trial = 1 AND trial_end_date < NOW() AND license_key IS NULL"
            );
            $stats['expired_trials'] = $stmt->fetch()['count'];
            
            // Licensed portals
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as count FROM {$this->prefix}portals 
                WHERE license_key IS NOT NULL AND license_valid_until > NOW()"
            );
            $stats['active_licenses'] = $stmt->fetch()['count'];
            
            // Expired licenses
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as count FROM {$this->prefix}portals 
                WHERE license_key IS NOT NULL AND license_valid_until < NOW()"
            );
            $stats['expired_licenses'] = $stmt->fetch()['count'];
            
            // Blocked portals
            $stmt = $this->connection->query(
                "SELECT COUNT(*) as count FROM {$this->prefix}portals WHERE is_blocked = 1"
            );
            $stats['blocked_portals'] = $stmt->fetch()['count'];
            
            // Portals with unregistered webhooks
            $stmt = $this->connection->query(
                "SELECT COUNT(DISTINCT portal_id) as count FROM {$this->prefix}settings 
                WHERE setting_key = 'webhooks_unregistered' AND setting_value = '1'"
            );
            $stats['webhooks_unregistered'] = $stmt->fetch()['count'];
            
            return $stats;
            
        } catch (\PDOException $e) {
            $this->logger->error('Failed to get license statistics', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

        
    /**
     * Check license status for a portal
     * UPDATED: Added webhook management tracking
     */
    public function checkLicenseStatus(string $domain): array
    {
        $portal = $this->getPortal($domain);
        
        if (!$portal) {
            return [
                'status' => 'not_found',
                'is_valid' => false,
                'reason' => 'Portal not found',
                'should_unregister_webhooks' => false
            ];
        }
        
        // Check if portal is blocked
        if ($portal['is_blocked']) {
            return [
                'status' => 'blocked',
                'is_valid' => false,
                'reason' => $portal['block_reason'] ?? 'Portal is blocked',
                'expires_at' => null,
                'days_remaining' => 0,
                'should_unregister_webhooks' => true
            ];
        }
        
        // Check if portal is inactive (uninstalled)
        if (!$portal['is_active']) {
            return [
                'status' => 'inactive',
                'is_valid' => false,
                'reason' => 'Portal is inactive',
                'expires_at' => null,
                'days_remaining' => 0,
                'should_unregister_webhooks' => true
            ];
        }
        
        // Check if has license
        if (!empty($portal['license_key'])) {
            $validUntil = strtotime($portal['license_valid_until']);
            $now = time();
            
            if ($validUntil > $now) {
                // License is valid
                return [
                    'status' => 'licensed',
                    'is_valid' => true,
                    'expires_at' => $portal['license_valid_until'],
                    'days_remaining' => ceil(($validUntil - $now) / 86400),
                    'license_key' => substr($portal['license_key'], 0, 8) . '...',
                    'should_unregister_webhooks' => false
                ];
            } else {
                // License expired
                return [
                    'status' => 'expired',
                    'is_valid' => false,
                    'reason' => 'License expired on ' . date('Y-m-d', $validUntil),
                    'expires_at' => $portal['license_valid_until'],
                    'days_expired' => ceil(($now - $validUntil) / 86400),
                    'days_remaining' => 0,
                    'should_unregister_webhooks' => true
                ];
            }
        }
        
        // Check trial status
        if ($portal['is_trial']) {
            $trialEnd = strtotime($portal['trial_end_date']);
            $now = time();
            
            if ($trialEnd > $now) {
                // Trial is still active
                return [
                    'status' => 'trial',
                    'is_valid' => true,
                    'expires_at' => $portal['trial_end_date'],
                    'days_remaining' => ceil(($trialEnd - $now) / 86400),
                    'trial_used' => (bool)$portal['trial_used'],
                    'should_unregister_webhooks' => false
                ];
            } else {
                // Trial expired
                $this->markTrialAsUsed($domain);
                
                return [
                    'status' => 'trial_expired',
                    'is_valid' => false,
                    'reason' => 'Trial period expired on ' . date('Y-m-d', $trialEnd),
                    'expires_at' => $portal['trial_end_date'],
                    'days_expired' => ceil(($now - $trialEnd) / 86400),
                    'days_remaining' => 0,
                    'trial_used' => true,
                    'should_unregister_webhooks' => true
                ];
            }
        }
        
        // No license and no trial
        return [
            'status' => 'expired',
            'is_valid' => false,
            'reason' => 'No valid license or trial',
            'days_remaining' => 0,
            'trial_used' => (bool)$portal['trial_used'],
            'should_unregister_webhooks' => true
        ];
    }
      
    /**
     * Mark trial as used when it expires
     * NEW METHOD
     */
    private function markTrialAsUsed(string $domain): void
    {
        try {
            $stmt = $this->connection->prepare(
                "UPDATE {$this->prefix}portals 
                SET trial_used = 1 
                WHERE domain = ? AND trial_used = 0"
            );
            $stmt->execute([$domain]);
            
            if ($stmt->rowCount() > 0) {
                $this->logger->info('Trial marked as used', ['domain' => $domain]);
            }
        } catch (\PDOException $e) {
            $this->logger->error('Failed to mark trial as used', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Block portal with reason
     * UPDATED: Added webhook unregistration flag
     */
    public function blockPortal(string $domain, string $reason = 'License expired'): bool
    {
        try {
            $stmt = $this->connection->prepare(
                "UPDATE {$this->prefix}portals 
                SET is_blocked = 1, 
                    block_reason = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE domain = ?"
            );
            $stmt->execute([$reason, $domain]);
            
            if ($stmt->rowCount() > 0) {
                $this->logger->warning('Portal blocked', [
                    'domain' => $domain,
                    'reason' => $reason
                ]);
                
                // Mark that webhooks should be unregistered
                $portal = $this->getPortal($domain);
                if ($portal) {
                    $this->saveSetting($portal['id'], 'block_reason', $reason);
                    $this->saveSetting($portal['id'], 'blocked_at', date('Y-m-d H:i:s'));
                }
                
                return true;
            }
            
            return false;
            
        } catch (\PDOException $e) {
            $this->logger->error('Failed to block portal', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Unblock portal
     * UPDATED: Clear webhook unregistration flag
     */
    public function unblockPortal(string $domain): bool
    {
        try {
            $stmt = $this->connection->prepare(
                "UPDATE {$this->prefix}portals 
                SET is_blocked = 0, 
                    block_reason = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE domain = ?"
            );
            $stmt->execute([$domain]);
            
            if ($stmt->rowCount() > 0) {
                $this->logger->info('Portal unblocked', ['domain' => $domain]);
                
                // Clear webhook unregistration flag
                $portal = $this->getPortal($domain);
                if ($portal) {
                    $this->saveSetting($portal['id'], 'webhooks_unregistered', '0');
                    $this->saveSetting($portal['id'], 'unblocked_at', date('Y-m-d H:i:s'));
                }
                
                return true;
            }
            
            return false;
            
        } catch (\PDOException $e) {
            $this->logger->error('Failed to unblock portal', [
                'domain' => $domain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get all portals that need webhook cleanup
     * NEW METHOD
     */
    public function getPortalsNeedingWebhookCleanup(): array
    {
        try {
            // Get portals where license is invalid but webhooks are not unregistered
            $stmt = $this->connection->prepare(
                "SELECT p.*, 
                        COALESCE(s.setting_value, '0') as webhooks_unregistered
                FROM {$this->prefix}portals p
                LEFT JOIN {$this->prefix}settings s 
                    ON p.id = s.portal_id AND s.setting_key = 'webhooks_unregistered'
                WHERE p.is_active = 1
                AND (
                    p.is_blocked = 1
                    OR (p.is_trial = 1 AND p.trial_end_date < NOW())
                    OR (p.license_key IS NOT NULL AND p.license_valid_until < NOW())
                )
                AND (s.setting_value IS NULL OR s.setting_value != '1')"
            );
            
            $stmt->execute();
            return $stmt->fetchAll();
            
        } catch (\PDOException $e) {
            $this->logger->error('Failed to get portals needing cleanup', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get portal settings
     */
    public function getSettings(int $portalId, ?string $key = null): array
    {
        try {
            if ($key) {
                $stmt = $this->connection->prepare(
                    "SELECT * FROM {$this->tablePrefix}settings 
                    WHERE portal_id = :portal_id AND setting_key = :key"
                );
                $stmt->execute(['portal_id' => $portalId, 'key' => $key]);
                $result = $stmt->fetch();
                return $result ? [$result['setting_key'] => $result['setting_value']] : [];
            } else {
                $stmt = $this->connection->prepare(
                    "SELECT * FROM {$this->tablePrefix}settings WHERE portal_id = :portal_id"
                );
                $stmt->execute(['portal_id' => $portalId]);
                $results = $stmt->fetchAll();
                
                $settings = [];
                foreach ($results as $row) {
                    $settings[$row['setting_key']] = $row['setting_value'];
                }
                return $settings;
            }
        } catch (PDOException $e) {
            $this->logger->error('Failed to get settings', [
                'portal_id' => $portalId,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
    
    /**
     * Save portal setting
     */
    public function saveSetting(int $portalId, string $key, $value): bool
    {
        try {
            $stmt = $this->connection->prepare(
                "INSERT INTO {$this->tablePrefix}settings (portal_id, setting_key, setting_value) 
                VALUES (:portal_id, :key, :value)
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                updated_at = CURRENT_TIMESTAMP"
            );
            
            return $stmt->execute([
                'portal_id' => $portalId,
                'key' => $key,
                'value' => is_array($value) ? json_encode($value) : $value
            ]);
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to save setting', [
                'portal_id' => $portalId,
                'key' => $key,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Clean expired cache entries
     */
    public function cleanExpiredCache(): int
    {
        try {
            $stmt = $this->connection->prepare(
                "DELETE FROM {$this->tablePrefix}cache WHERE expires_at < :now"
            );
            $stmt->execute(['now' => time()]);
            
            return $stmt->rowCount();
            
        } catch (PDOException $e) {
            $this->logger->error('Failed to clean cache', ['error' => $e->getMessage()]);
            return 0;
        }
    }
    
    /**
     * Begin transaction
     */
    public function beginTransaction(): bool
    {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Commit transaction
     */
    public function commit(): bool
    {
        return $this->connection->commit();
    }
    
    /**
     * Rollback transaction
     */
    public function rollback(): bool
    {
        return $this->connection->rollBack();
    }
}