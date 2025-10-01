<?php

namespace Bitrix;

use Core\Database;
use Core\Logger;
use Exception;
use PDOException;

/**
 * Modified CRest class for working with database instead of files
 * Based on original CRest v1.36
 */
class CRest
{
    const VERSION = '1.36-modified';
    const BATCH_COUNT = 50;
    const TYPE_TRANSPORT = 'json';
    
    private static ?string $currentDomain = null;
    private static ?Logger $logger = null;
    
    /**
     * Set current working domain
     */
    public static function setDomain(string $domain): void
    {
        self::$currentDomain = $domain;
    }
    
    /**
     * Get logger instance
     */
    private static function getLogger(): Logger
    {
        if (self::$logger === null) {
            self::$logger = new Logger('bitrix');
        }
        return self::$logger;
    }
    
    /**
     * Install application
     */
    public static function installApp(): array
    {
        $result = [
            'rest_only' => true,
            'install' => false
        ];
        
        if ($_REQUEST['event'] == 'ONAPPINSTALL' && !empty($_REQUEST['auth'])) {
            $result['install'] = static::setAppSettings($_REQUEST['auth'], true);
        } elseif ($_REQUEST['PLACEMENT'] == 'DEFAULT') {
            $result['rest_only'] = false;
            $result['install'] = static::setAppSettings([
                'access_token' => htmlspecialchars($_REQUEST['AUTH_ID']),
                'expires_in' => htmlspecialchars($_REQUEST['AUTH_EXPIRES']),
                'application_token' => htmlspecialchars($_REQUEST['APP_SID']),
                'refresh_token' => htmlspecialchars($_REQUEST['REFRESH_ID']),
                'domain' => htmlspecialchars($_REQUEST['DOMAIN']),
                'client_endpoint' => 'https://' . htmlspecialchars($_REQUEST['DOMAIN']) . '/rest/',
            ], true);
        }
        
        self::getLogger()->info('Application install attempt', [
            'domain' => self::$currentDomain,
            'result' => $result
        ]);
        
        return $result;
    }
    
    /**
     * Main method to call Bitrix24 API
     */
    public static function call(string $method, array $params = []): array
    {
        $arPost = [
            'method' => $method,
            'params' => $params
        ];
        
        if (defined('C_REST_CURRENT_ENCODING')) {
            $arPost['params'] = static::changeEncoding($arPost['params']);
        }
        
        $result = static::callCurl($arPost);
        return $result;
    }
    
    /**
     * Batch call to Bitrix24 API
     */
    public static function callBatch(array $arData, int $halt = 0): array
    {
        $arResult = [];
        
        if (is_array($arData)) {
            if (defined('C_REST_CURRENT_ENCODING')) {
                $arData = static::changeEncoding($arData);
            }
            
            $arDataRest = [];
            $i = 0;
            
            foreach ($arData as $key => $data) {
                if (!empty($data['method'])) {
                    $i++;
                    if (static::BATCH_COUNT >= $i) {
                        $arDataRest['cmd'][$key] = $data['method'];
                        if (!empty($data['params'])) {
                            $arDataRest['cmd'][$key] .= '?' . http_build_query($data['params']);
                        }
                    }
                }
            }
            
            if (!empty($arDataRest)) {
                $arDataRest['halt'] = $halt;
                $arPost = [
                    'method' => 'batch',
                    'params' => $arDataRest
                ];
                $arResult = static::callCurl($arPost);
            }
        }
        
        return $arResult;
    }
    
    /**
     * Execute CURL request
     */
    protected static function callCurl(array $arParams): array
    {
        if (!function_exists('curl_init')) {
            return [
                'error' => 'error_php_lib_curl',
                'error_information' => 'need install curl lib'
            ];
        }
        
        $arSettings = static::getAppSettings();
        
        if ($arSettings !== false) {
            if (isset($arParams['this_auth']) && $arParams['this_auth'] == 'Y') {
                $url = 'https://oauth.bitrix.info/oauth/token/';
            } else {
                $url = $arSettings['client_endpoint'] . $arParams['method'] . '.' . static::TYPE_TRANSPORT;
                if (empty($arSettings['is_web_hook']) || $arSettings['is_web_hook'] != 'Y') {
                    $arParams['params']['auth'] = $arSettings['access_token'];
                }
            }
            
            $sPostFields = http_build_query($arParams['params']);
            
            try {
                $obCurl = curl_init();
                curl_setopt($obCurl, CURLOPT_URL, $url);
                curl_setopt($obCurl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($obCurl, CURLOPT_POSTREDIR, 10);
                curl_setopt($obCurl, CURLOPT_USERAGENT, 'Bitrix24 CRest PHP ' . static::VERSION);
                
                if ($sPostFields) {
                    curl_setopt($obCurl, CURLOPT_POST, true);
                    curl_setopt($obCurl, CURLOPT_POSTFIELDS, $sPostFields);
                }
                
                curl_setopt($obCurl, CURLOPT_FOLLOWLOCATION, 
                    isset($arParams['followlocation']) ? $arParams['followlocation'] : 1);
                
                if (defined("C_REST_IGNORE_SSL") && C_REST_IGNORE_SSL === true) {
                    curl_setopt($obCurl, CURLOPT_SSL_VERIFYPEER, false);
                    curl_setopt($obCurl, CURLOPT_SSL_VERIFYHOST, false);
                }
                
                $out = curl_exec($obCurl);
                $info = curl_getinfo($obCurl);
                
                if (curl_errno($obCurl)) {
                    $info['curl_error'] = curl_error($obCurl);
                }
                
                $result = static::expandData($out);
                curl_close($obCurl);
                
                if (!empty($result['error'])) {
                    if ($result['error'] == 'expired_token' && empty($arParams['this_auth'])) {
                        $result = static::GetNewAuth($arParams);
                    } else {
                        $arErrorInform = [
                            'expired_token' => 'expired token, cant get new auth? Check access oauth server.',
                            'invalid_token' => 'invalid token, need reinstall application',
                            'invalid_grant' => 'invalid grant, check out define C_REST_CLIENT_SECRET or C_REST_CLIENT_ID',
                            'invalid_client' => 'invalid client, check out define C_REST_CLIENT_SECRET or C_REST_CLIENT_ID',
                            'QUERY_LIMIT_EXCEEDED' => 'Too many requests, maximum 2 query by second',
                            'ERROR_METHOD_NOT_FOUND' => 'Method not found! You can see the permissions of the application: CRest::call(\'scope\')',
                            'NO_AUTH_FOUND' => 'Some setup error b24, check in table "b_module_to_module" event "OnRestCheckAuth"',
                            'INTERNAL_SERVER_ERROR' => 'Server down, try later'
                        ];
                        
                        if (!empty($arErrorInform[$result['error']])) {
                            $result['error_information'] = $arErrorInform[$result['error']];
                        }
                    }
                }
                
                if (!empty($info['curl_error'])) {
                    $result['error'] = 'curl_error';
                    $result['error_information'] = $info['curl_error'];
                }
                
                self::getLogger()->debug('API call executed', [
                    'method' => $arParams['method'] ?? 'unknown',
                    'domain' => self::$currentDomain,
                    'success' => empty($result['error'])
                ]);
                
                return $result;
                
            } catch (Exception $e) {
                self::getLogger()->error('API call exception', [
                    'message' => $e->getMessage(),
                    'code' => $e->getCode(),
                    'method' => $arParams['method'] ?? 'unknown'
                ]);
                
                return [
                    'error' => 'exception',
                    'error_exception_code' => $e->getCode(),
                    'error_information' => $e->getMessage(),
                ];
            }
        } else {
            self::getLogger()->warning('No settings found for API call', [
                'domain' => self::$currentDomain
            ]);
        }
        
        return [
            'error' => 'no_install_app',
            'error_information' => 'error install app, pls install local application'
        ];
    }
    
    /**
     * Get new authorization
     */
    private static function GetNewAuth(array $arParams): array
    {
        $result = [];
        $arSettings = static::getAppSettings();
        
        if ($arSettings !== false) {
            $config = require CONFIG_PATH . '/app.php';
            
            $arParamsAuth = [
                'this_auth' => 'Y',
                'params' => [
                    'client_id' => $config['bitrix']['client_id'],
                    'grant_type' => 'refresh_token',
                    'client_secret' => $config['bitrix']['client_secret'],
                    'refresh_token' => $arSettings['refresh_token'],
                ]
            ];
            
            $newData = static::callCurl($arParamsAuth);
            
            if (isset($newData['access_token'])) {
                unset($newData['client_id']);
                unset($newData['client_secret']);
                unset($newData['error']);
                
                if (static::setAppSettings($newData)) {
                    $arParams['this_auth'] = 'N';
                    $result = static::callCurl($arParams);
                }
                
                self::getLogger()->info('Authorization refreshed', [
                    'domain' => self::$currentDomain
                ]);
            } else {
                self::getLogger()->error('Failed to refresh authorization', [
                    'domain' => self::$currentDomain,
                    'error' => $newData['error'] ?? 'unknown'
                ]);
            }
        }
        
        return $result;
    }
    
    /**
     * Set application settings to database
     */
    private static function setAppSettings(array $arSettings, bool $isInstall = false): bool
    {
        $return = false;
        
        if (is_array($arSettings)) {
            $oldData = static::getAppSettings();
            
            if ($isInstall != true && !empty($oldData) && is_array($oldData)) {
                $arSettings = array_merge($oldData, $arSettings);
            }
            
            $return = static::setSettingData($arSettings);
        }
        
        return $return;
    }
    
    /**
     * Get application settings from database
     */
    private static function getAppSettings(): array
    {
        if (defined("C_REST_WEB_HOOK_URL") && !empty(C_REST_WEB_HOOK_URL)) {
            $arData = [
                'client_endpoint' => C_REST_WEB_HOOK_URL,
                'is_web_hook' => 'Y'
            ];
            $isCurrData = true;
        } else {
            $arData = static::getSettingData();
            
            $isCurrData = false;
            if (
                !empty($arData['access_token']) &&
                !empty($arData['domain']) &&
                !empty($arData['refresh_token']) &&
                !empty($arData['application_token']) &&
                !empty($arData['client_endpoint'])
            ) {
                $isCurrData = true;
            }
        }
        
        return ($isCurrData) ? $arData : [];
    }
    
    /**
     * Get settings from database
     */
    protected static function getSettingData(): array
    {
        if (!self::$currentDomain) {
            return [];
        }
        
        try {
            $db = Database::getInstance();
            if (!$db) {
                return [];
            }
            
            $portal = $db->getPortal(self::$currentDomain);
            
            if ($portal) {
                return [
                    'domain' => $portal['domain'],
                    'access_token' => $portal['access_token'],
                    'refresh_token' => $portal['refresh_token'],
                    'application_token' => $portal['application_token'],
                    'client_endpoint' => $portal['client_endpoint'],
                    'server_endpoint' => $portal['server_endpoint'],
                    'member_id' => $portal['member_id'],
                    'user_id' => $portal['user_id'],
                    'expires_at' => $portal['expires_at']
                ];
            }
        } catch (Exception $e) {
            self::getLogger()->error('Failed to get settings from database', [
                'domain' => self::$currentDomain,
                'error' => $e->getMessage()
            ]);
        }
        
        return [];
    }
    
    /**
     * Save settings to database
     */
    protected static function setSettingData(array $arSettings): bool
    {
        if (!self::$currentDomain) {
            self::$currentDomain = $arSettings['domain'] ?? null;
        }
        
        if (!self::$currentDomain) {
            return false;
        }
        
        try {
            $db = Database::getInstance();
            if (!$db) {
                return false;
            }
            
            // Calculate expires_at if expires_in is provided
            if (isset($arSettings['expires_in']) && !isset($arSettings['expires_at'])) {
                $arSettings['expires_at'] = time() + $arSettings['expires_in'];
            }
            
            return $db->savePortal(self::$currentDomain, $arSettings);
            
        } catch (Exception $e) {
            self::getLogger()->error('Failed to save settings to database', [
                'domain' => self::$currentDomain,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    /**
     * Change encoding if needed
     */
    protected static function changeEncoding($data, bool $encoding = true)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $k => $item) {
                $k = static::changeEncoding($k, $encoding);
                $result[$k] = static::changeEncoding($item, $encoding);
            }
        } else {
            if ($encoding) {
                $result = iconv(C_REST_CURRENT_ENCODING, "UTF-8//TRANSLIT", $data);
            } else {
                $result = iconv("UTF-8", C_REST_CURRENT_ENCODING, $data);
            }
        }
        
        return $result;
    }
    
    /**
     * Wrap data to JSON
     */
    protected static function wrapData($data): string
    {
        if (defined('C_REST_CURRENT_ENCODING')) {
            $data = static::changeEncoding($data, true);
        }
        
        return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    }
    
    /**
     * Expand JSON data
     */
    protected static function expandData(string $data): array
    {
        $return = json_decode($data, true);
        
        if (defined('C_REST_CURRENT_ENCODING')) {
            $return = static::changeEncoding($return, false);
        }
        
        return $return ?: [];
    }
}