# REST API Documentation

## Overview

The application provides a comprehensive REST API for frontend applications to interact with Bitrix24 and manage application data. All API endpoints are accessible through `/api/rest.php`.

## Base URL

```
https://your-domain.com/api/rest.php
```

## Authentication

### Headers

```http
Authorization: Bearer {application_token}
X-Bitrix-Domain: {domain}
Content-Type: application/json
```

### Token Sources

1. **Application Token** - From `auth['application_token']` during installation
2. **Session Token** - From `APP_DATA.app_sid` in frontend
3. **Domain** - Required in request body or header

## Core Endpoints

### 1. Application Information

#### Get Application Info
```http
GET /api/rest.php/info?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "app": {
      "name": "Bitrix24 App Template",
      "version": "1.0.0"
    },
    "portal": {
      "domain": "example.bitrix24.com",
      "member_id": "abc123...",
      "is_trial": true,
      "created_at": "2025-01-01 12:00:00"
    }
  }
}
```

### 2. Portal Management

#### Get Portal Settings
```http
GET /api/rest.php/portal/settings?domain={domain}&key={optional_key}
```

**Parameters:**
- `domain` (required) - Portal domain
- `key` (optional) - Specific setting key

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": {
      "features": "{\"crm\":true,\"tasks\":false}",
      "app_version": "1.0.0",
      "timezone": "UTC"
    }
  }
}
```

#### Save Portal Settings
```http
POST /api/rest.php/portal/settings
```

**Request Body:**
```json
{
  "domain": "example.bitrix24.com",
  "key": "features",
  "value": "{\"crm\":true,\"tasks\":true}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "saved": true,
    "key": "features"
  }
}
```

#### Delete Portal Setting
```http
DELETE /api/rest.php/portal/settings
```

**Request Body:**
```json
{
  "domain": "example.bitrix24.com",
  "key": "features"
}
```

#### Validate Portal
```http
GET /api/rest.php/portal/validate?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "domain": "example.bitrix24.com",
    "member_id": "abc123...",
    "license_status": {
      "status": "trial",
      "is_valid": true,
      "days_remaining": 10
    },
    "is_trial": true,
    "is_active": true,
    "is_blocked": false,
    "token_remaining_seconds": 3500
  }
}
```

### 3. License Management

#### Check License Status
```http
GET /api/rest.php/license/check?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "license_status": {
      "status": "trial",
      "is_valid": true,
      "expires_at": "2025-02-14 12:00:00",
      "days_remaining": 10
    },
    "portal": {
      "domain": "example.bitrix24.com",
      "is_trial": true,
      "trial_used": false,
      "has_license": false
    }
  }
}
```

#### Activate License
```http
POST /api/rest.php/license/activate
```

**Request Body:**
```json
{
  "domain": "example.bitrix24.com",
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "valid_until": "2026-12-31 23:59:59"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activated": true,
    "valid_until": "2026-12-31 23:59:59",
    "message": "License activated successfully"
  }
}
```

#### Validate License Key
```http
POST /api/rest.php/license/validate
```

**Request Body:**
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "message": "License key format is valid",
    "valid_until": "2026-12-31"
  }
}
```

### 4. Bitrix24 API Proxy

#### Single API Call
```http
POST /api/rest.php/bitrix/call
```

**Request Body:**
```json
{
  "domain": "example.bitrix24.com",
  "method": "crm.deal.get",
  "params": {
    "id": 123
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "ID": "123",
      "TITLE": "Deal Name",
      "STAGE_ID": "NEW"
    },
    "total": 1
  }
}
```

#### Batch API Call
```http
POST /api/rest.php/bitrix/batch
```

**Request Body:**
```json
{
  "domain": "example.bitrix24.com",
  "commands": {
    "deal": {
      "method": "crm.deal.get",
      "params": {"id": 123}
    },
    "contact": {
      "method": "crm.contact.get",
      "params": {"id": 456}
    }
  },
  "halt": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "deal": {"ID": "123", "TITLE": "Deal Name"},
      "contact": {"ID": "456", "NAME": "John"}
    },
    "result_error": {},
    "result_total": {"deal": 1, "contact": 1}
  }
}
```

### 5. Token Management

#### Refresh Tokens
```http
POST /api/rest.php/token/refresh
```

**Request Body:**
```json
{
  "domain": "example.bitrix24.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refreshed": true,
    "expires_at": "2025-01-31 13:00:00"
  }
}
```

### 6. Diagnostics

#### Full Diagnostics
```http
GET /api/rest.php/diagnostics/full?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portal": {
      "domain": "example.bitrix24.com",
      "is_active": true,
      "is_trial": true,
      "trial_end_date": "2025-02-14"
    },
    "license": {
      "status": "trial",
      "is_valid": true,
      "days_remaining": 10
    },
    "tokens": {
      "valid": true,
      "expires_in": 3500
    },
    "database": {
      "portals": 5,
      "settings": 20,
      "logs": 150
    },
    "system": {
      "php_version": "8.0.0",
      "memory_usage": 52428800,
      "execution_time": 0.123
    }
  }
}
```

#### Event Handlers Diagnostics
```http
GET /api/rest.php/diagnostics/handlers?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event_handlers": [
      {
        "event": "ONCRMDEALUPDATE",
        "handler": "https://your-domain.com/api/webhook.php",
        "auth_type": 0
      }
    ],
    "placements": [],
    "scope": ["crm", "task", "user"]
  }
}
```

#### Storage Diagnostics
```http
GET /api/rest.php/diagnostics/storage?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "portals": 5,
    "settings": 150,
    "tokens": 10,
    "logs": 5000,
    "cache": 50,
    "sizes": [
      {"Table": "app_portals", "Size_MB": "0.02"},
      {"Table": "app_logs", "Size_MB": "1.50"}
    ]
  }
}
```

#### Database Diagnostics
```http
GET /api/rest.php/diagnostics/database?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connection": true,
    "version": "8.0.32",
    "driver": "mysql",
    "portal_data": {
      "id": 1,
      "records_count": {
        "portals": 5,
        "settings": 20
      }
    }
  }
}
```

### 7. Logs

#### Get Recent Error Logs
```http
GET /api/rest.php/logs/recent?domain={domain}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "errors": [
      {
        "timestamp": "2025-01-31 12:00:00",
        "level": "error",
        "channel": "handler",
        "message": "Token expired",
        "context": {
          "domain": "example.bitrix24.com",
          "method": "crm.deal.get"
        }
      }
    ]
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": true,
  "message": "Error description",
  "code": 400,
  "details": {
    "additional": "information"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Success |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 402 | Payment Required | License expired |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 405 | Method Not Allowed | Invalid HTTP method |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

## Rate Limiting

- **Bitrix24 API**: 2 requests/second (120/minute)
- **Internal API**: No hard limits, but monitoring enabled
- **Batch operations**: Maximum 50 commands per batch

### Rate Limit Headers

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 115
X-RateLimit-Reset: 1706700000
```

## JavaScript Examples

### Using Fetch API

```javascript
// Get portal settings
async function getPortalSettings() {
  const response = await fetch('/api/rest.php/portal/settings?domain=' + APP_DATA.domain, {
    headers: {
      'Authorization': 'Bearer ' + APP_DATA.app_sid
    }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Settings:', data.data.settings);
  }
}

// Call Bitrix24 method
async function callBitrixMethod(method, params) {
  const response = await fetch('/api/rest.php/bitrix/call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + APP_DATA.app_sid
    },
    body: JSON.stringify({
      domain: APP_DATA.domain,
      method: method,
      params: params
    })
  });
  
  return await response.json();
}

// Activate license
async function activateLicense(licenseKey) {
  const response = await fetch('/api/rest.php/license/activate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + APP_DATA.app_sid
    },
    body: JSON.stringify({
      domain: APP_DATA.domain,
      license_key: licenseKey
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('License activated!');
    window.location.reload();
  } else {
    alert('Error: ' + result.message);
  }
}
```

### Using Axios

```javascript
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = '/api/rest.php';
axios.defaults.headers.common['Authorization'] = 'Bearer ' + APP_DATA.app_sid;
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Get diagnostics
async function getDiagnostics() {
  try {
    const response = await axios.get('/diagnostics/full', {
      params: { domain: APP_DATA.domain }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Diagnostics error:', error.response?.data?.message);
  }
}

// Batch API call
async function batchCall(commands) {
  try {
    const response = await axios.post('/bitrix/batch', {
      domain: APP_DATA.domain,
      commands: commands,
      halt: false
    });
    
    return response.data.data.result;
  } catch (error) {
    if (error.response?.status === 402) {
      // License expired
      showLicenseModal();
    }
  }
}
```

## Webhook API

### Webhook Endpoint

```
POST /api/webhook.php
```

### Event Structure

```json
{
  "event": "ONCRMDEALUPDATE",
  "auth": {
    "domain": "example.bitrix24.com",
    "member_id": "abc123...",
    "user_id": 1,
    "application_token": "...",
    "access_token": "...",
    "refresh_token": "..."
  },
  "data": {
    "FIELDS": {
      "ID": 123,
      "TITLE": "Updated Deal"
    }
  }
}
```

### Supported Events

- **Application**: ONAPPINSTALL, ONAPPUNINSTALL, ONAPPUPDATE
- **CRM Deal**: ONCRMDEALADD, ONCRMDEALUPDATE, ONCRMDEALDELETE
- **CRM Contact**: ONCRMCONTACTADD, ONCRMCONTACTUPDATE, ONCRMCONTACTDELETE
- **CRM Company**: ONCRMCOMPANYADD, ONCRMCOMPANYUPDATE, ONCRMCOMPANYDELETE
- **CRM Lead**: ONCRMLEADADD, ONCRMLEADUPDATE, ONCRMLEADDELETE
- **Tasks**: ONTASKADD, ONTASKUPDATE, ONTASKDELETE

## Testing

### cURL Examples

```bash
# Check health
curl https://your-domain.com/api/health.php

# Get portal info
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-domain.com/api/rest.php/info?domain=example.bitrix24.com"

# Activate license
curl -X POST https://your-domain.com/api/rest.php/license/activate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "domain":"example.bitrix24.com",
       "license_key":"TEST-1234-5678-90AB"
     }'

# Call Bitrix24 API
curl -X POST https://your-domain.com/api/rest.php/bitrix/call \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "domain":"example.bitrix24.com",
       "method":"user.current",
       "params":{}
     }'
```

### Postman Collection

Import this collection to Postman for testing:

```json
{
  "info": {
    "name": "Bitrix24 App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Portal Info",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{base_url}}/api/rest.php/info?domain={{domain}}"
      }
    },
    {
      "name": "Check License",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": "{{base_url}}/api/rest.php/license/check?domain={{domain}}"
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "https://your-domain.com"
    },
    {
      "key": "token",
      "value": "your-app-token"
    },
    {
      "key": "domain",
      "value": "example.bitrix24.com"
    }
  ]
}
```


### Webhook Management Status

#### Get Webhook Status
```http
GET /api/rest.php/webhooks/status?domain={domain}
Response:
json{
  "webhooks_registered": true,
  "webhooks_count": 5,
  "unregistered_at": null,
  "unregistered_reason": null,
  "can_reregister": false
}
```


## Best Practices

1. **Always include domain** in requests
2. **Handle token expiration** - implement auto-refresh
3. **Implement retry logic** for failed requests
4. **Cache frequently used data** to reduce API calls
5. **Use batch operations** when possible
6. **Monitor rate limits** via `/api/stats.php`
7. **Log all errors** for debugging
8. **Validate input** before sending to API
9. **Use HTTPS** in production
10. **Implement proper error handling** in frontend

## Security Considerations

- Never expose `client_secret` in frontend code
- Always validate `application_token` on server
- Use HTTPS for all API communications
- Implement CORS properly
- Sanitize all user input
- Log security-related events
- Regular security audits
- Keep dependencies updated