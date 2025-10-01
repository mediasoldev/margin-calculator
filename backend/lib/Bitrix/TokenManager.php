<?php

namespace Bitrix;

use Core\Database;
use Core\Logger;
use Exception;

/**
 * Token Manager for Bitrix24 OAuth tokens
 */
class TokenManager
{
    private string $domain;
    private ?Database $db;
    private Logger $logger;
    private ?array $portal = null;
    private array $config;
    
    /**
     * Constructor
     */
    public function __construct(string $domain)
    {
        $this->domain = $domain;
        $this->db = Database::getInstance();
        $this->logger = new Logger('token_manager');
        $this->config = require CONFIG_PATH . '/app.php';
        
        // Load portal data
        if ($this->db) {
            $this->portal = $this->db->getPortal($domain);
        }
    }
    
    /**
     * Get current tokens
     */
    public function getTokens(): ?array
    {
        if (!$this->portal) {
            $this->logger->warning('Portal not found', ['domain' => $this->domain]);
            return null;
        }
        
        return [
            'access_token' => $this->portal['access_token'],
            'refresh_token' => $this->portal['refresh_token'],
            'expires_at' => $this->portal['expires_at'],
            'application_token' => $this->portal['application_token'],
        ];
    }
    
    /**
     * Get valid access token (refresh if expired)
     */
    public function getValidAccessToken(): ?string
    {
        if (!$this->portal) {
            return null;
        }
        
        // Check if token is expired
        if ($this->isExpired()) {
            $this->logger->info('Token expired, refreshing', ['domain' => $this->domain]);
            
            if (!$this->refreshTokens()) {
                $this->logger->error('Failed to refresh token', ['domain' => $this->domain]);
                return null;
            }
        }
        
        return $this->portal['access_token'];
    }
    
    /**
     * Check if access token is expired
     */
    public function isExpired(): bool
    {
        if (!$this->portal || !$this->portal['expires_at']) {
            return true;
        }
        
        // Consider token expired 60 seconds before actual expiration
        return time() >= ($this->portal['expires_at'] - 60);
    }
    
    /**
     * Refresh tokens using refresh_token
     */
    public function refreshTokens(): bool
    {
        if (!$this->portal || !$this->portal['refresh_token']) {
            $this->logger->error('No refresh token available', ['domain' => $this->domain]);
            return false;
        }
        
        try {
            // Prepare OAuth request
            $params = [
                'grant_type' => 'refresh_token',
                'client_id' => $this->config['bitrix']['client_id'],
                'client_secret' => $this->config['bitrix']['client_secret'],
                'refresh_token' => $this->portal['refresh_token'],
            ];
            
            // Make OAuth request
            $response = $this->makeOAuthRequest($params);
            
            if (isset($response['access_token'])) {
                // Save new tokens
                $this->saveTokens($response);
                
                $this->logger->info('Tokens refreshed successfully', [
                    'domain' => $this->domain
                ]);
                
                return true;
            } else {
                $this->logger->error('OAuth response missing access_token', [
                    'domain' => $this->domain,
                    'response' => $response
                ]);
                
                return false;
            }
            
        } catch (Exception $e) {
            $this->logger->error('Failed to refresh tokens', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    /**
     * Exchange authorization code for tokens
     */
    public function exchangeCode(string $code, string $serverEndpoint): bool
    {
        try {
            // Prepare OAuth request
            $params = [
                'grant_type' => 'authorization_code',
                'client_id' => $this->config['bitrix']['client_id'],
                'client_secret' => $this->config['bitrix']['client_secret'],
                'code' => $code,
                'domain' => $serverEndpoint,
            ];
            
            // Make OAuth request
            $response = $this->makeOAuthRequest($params);
            
            if (isset($response['access_token'])) {
                // Save new tokens
                $this->saveTokens($response);
                
                $this->logger->info('Code exchanged successfully', [
                    'domain' => $this->domain
                ]);
                
                return true;
            } else {
                $this->logger->error('OAuth response missing access_token', [
                    'domain' => $this->domain,
                    'response' => $response
                ]);
                
                return false;
            }
            
        } catch (Exception $e) {
            $this->logger->error('Failed to exchange code', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    /**
     * Save tokens to database
     */
    public function saveTokens(array $tokens): bool
    {
        if (!$this->db) {
            return false;
        }
        
        try {
            // Calculate expires_at
            $expiresAt = time() + ($tokens['expires_in'] ?? 3600);
            
            // Prepare data
            $data = [
                'access_token' => $tokens['access_token'],
                'refresh_token' => $tokens['refresh_token'] ?? $this->portal['refresh_token'],
                'expires_at' => $expiresAt,
            ];
            
            // Update in database
            $result = $this->db->updateTokens($this->domain, $data);
            
            if ($result) {
                // Update local portal data
                $this->portal['access_token'] = $data['access_token'];
                $this->portal['refresh_token'] = $data['refresh_token'];
                $this->portal['expires_at'] = $expiresAt;
                
                $this->logger->debug('Tokens saved', [
                    'domain' => $this->domain,
                    'expires_at' => date('Y-m-d H:i:s', $expiresAt)
                ]);
            }
            
            return $result;
            
        } catch (Exception $e) {
            $this->logger->error('Failed to save tokens', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    /**
     * Make OAuth request to Bitrix24
     */
    private function makeOAuthRequest(array $params): array
    {
        $url = $this->config['bitrix']['oauth_url'] ?? 'https://oauth.bitrix.info/oauth/token/';
        
        // Initialize cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Bitrix24 App Template');
        
        // SSL options
        if (!($this->config['security']['verify_ssl'] ?? true)) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        
        // Execute request
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("cURL error: $error");
        }
        
        if ($httpCode !== 200) {
            $this->logger->error('OAuth request failed', [
                'http_code' => $httpCode,
                'response' => $response
            ]);
            throw new Exception("OAuth request failed with HTTP code: $httpCode");
        }
        
        // Decode response
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Invalid JSON response: " . json_last_error_msg());
        }
        
        // Check for OAuth errors
        if (isset($data['error'])) {
            $errorMsg = $data['error'] . (isset($data['error_description']) ? 
                ': ' . $data['error_description'] : '');
            
            $this->logger->error('OAuth error', [
                'domain' => $this->domain,
                'error' => $data['error'],
                'description' => $data['error_description'] ?? ''
            ]);
            
            throw new Exception("OAuth error: $errorMsg");
        }
        
        return $data;
    }
    
    /**
     * Validate tokens
     */
    public function validateTokens(): bool
    {
        if (!$this->portal) {
            return false;
        }
        
        // Check if we have required tokens
        if (empty($this->portal['access_token']) || empty($this->portal['refresh_token'])) {
            return false;
        }
        
        // If expired, try to refresh
        if ($this->isExpired()) {
            return $this->refreshTokens();
        }
        
        return true;
    }
    
    /**
     * Revoke tokens (logout)
     */
    public function revokeTokens(): bool
    {
        if (!$this->portal || !$this->db) {
            return false;
        }
        
        try {
            // Clear tokens in database
            $result = $this->db->updateTokens($this->domain, [
                'access_token' => null,
                'refresh_token' => null,
                'expires_at' => 0,
            ]);
            
            if ($result) {
                $this->logger->info('Tokens revoked', ['domain' => $this->domain]);
            }
            
            return $result;
            
        } catch (Exception $e) {
            $this->logger->error('Failed to revoke tokens', [
                'domain' => $this->domain,
                'error' => $e->getMessage()
            ]);
            
            return false;
        }
    }
    
    /**
     * Get remaining token lifetime in seconds
     */
    public function getRemainingLifetime(): int
    {
        if (!$this->portal || !$this->portal['expires_at']) {
            return 0;
        }
        
        $remaining = $this->portal['expires_at'] - time();
        
        return max(0, $remaining);
    }
    
    /**
     * Create instance from auth array (from webhook)
     */
    public static function fromAuth(array $auth): self
    {
        $domain = $auth['domain'] ?? '';
        $manager = new self($domain);
        
        // If portal doesn't exist, create it
        if (!$manager->portal && $manager->db) {
            $manager->db->savePortal($domain, [
                'member_id' => $auth['member_id'] ?? '',
                'user_id' => $auth['user_id'] ?? 0,
                'access_token' => $auth['access_token'] ?? '',
                'refresh_token' => $auth['refresh_token'] ?? '',
                'application_token' => $auth['application_token'] ?? '',
                'server_endpoint' => $auth['server_endpoint'] ?? '',
                'client_endpoint' => $auth['client_endpoint'] ?? "https://$domain/rest/",
                'expires_at' => time() + ($auth['expires_in'] ?? 3600),
            ]);
            
            // Reload portal data
            $manager->portal = $manager->db->getPortal($domain);
        }
        
        return $manager;
    }
}