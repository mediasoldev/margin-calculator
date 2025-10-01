# Event Handlers Documentation

## Overview

Event handlers are PHP classes that process incoming events from Bitrix24. The system uses a base handler class with common functionality and specific handler classes for each event type.

## Architecture

```
Bitrix24 Event → webhook.php → routes.php → Handler Class → Response
                                    ↓
                              Find handler
                                    ↓
                            Handler::process()
                                    ↓
                        validateAuth() → checkLicense() → handle()
```

## Base Handler

All event handlers extend the `BaseHandler` class which provides:

- Authentication validation
- License checking
- Bitrix24 API calls
- Token management
- Logging
- Database access
- Common helper methods

### BaseHandler Structure

```php
namespace Handlers;

abstract class BaseHandler
{
    protected array $request;      // Full request data
    protected string $domain;      // Portal domain
    protected array $auth;         // Authentication data
    protected ?Database $db;       // Database instance
    protected Logger $logger;      // Logger instance
    protected ?array $portal;      // Portal data from DB
    protected ?TokenManager $tokenManager;  // Token manager
    
    abstract public function handle(): array;  // Must be implemented
    
    public function process(): void { ... }    // Main processor
}
```

## Creating Custom Handler

### Step 1: Create Handler Class

Create new file in `backend/handlers/events/YourHandler.php`:

```php
<?php

namespace Handlers\Events;

use Handlers\BaseHandler;
use Exception;

class YourCustomHandler extends BaseHandler
{
    /**
     * Handle the event
     * @return array Response data
     */
    public function handle(): array
    {
        try {
            // Get event data
            $data = $this->getEventData();
            $entityId = $this->getEventField('ID');
            
            // Your business logic
            $result = $this->processEntity($entityId);
            
            // Return success response
            return [
                'success' => true,
                'message' => 'Entity processed successfully',
                'data' => $result
            ];
            
        } catch (Exception $e) {
            $this->logger->error('Processing failed', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'error' => true,
                'message' => 'Processing failed: ' . $e->getMessage(),
                'code' => 500
            ];
        }
    }
    
    /**
     * Process entity
     */
    private function processEntity($id): array
    {
        // Call Bitrix24 API
        $entity = $this->callBitrixMethod('crm.deal.get', ['id' => $id]);
        
        if (isset($entity['error'])) {
            throw new Exception('Failed to get entity');
        }
        
        // Process data
        $processedData = $this->transformData($entity['result']);
        
        // Save to database
        $this->saveSetting('last_processed', json_encode([
            'id' => $id,
            'timestamp' => time()
        ]));
        
        // Log success
        $this->logger->info('Entity processed', [
            'id' => $id,
            'domain' => $this->domain
        ]);
        
        return $processedData;
    }
    
    /**
     * Transform entity data
     */
    private function transformData(array $data): array
    {
        return [
            'id' => $data['ID'],
            'title' => $data['TITLE'],
            'processed_at' => date('Y-m-d H:i:s')
        ];
    }
}
```

### Step 2: Register in Routes

Add to `backend/config/routes.php`:

```php
return [
    // ... existing routes ...
    
    // Your custom event
    'oncustomevent' => \Handlers\Events\YourCustomHandler::class,
    
    // Multiple events can use same handler
    'oncustomadd' => \Handlers\Events\YourCustomHandler::class,
    'oncustomupdate' => \Handlers\Events\YourCustomHandler::class,
];
```

### Step 3: Register in Bitrix24

Register event handler during installation or manually:

```php
// In InstallHandler or via API
$this->callBitrixMethod('event.bind', [
    'event' => 'ONCUSTOMEVENT',
    'handler' => 'https://your-domain.com/api/webhook.php',
    'auth_type' => 0
]);
```

## Available Helper Methods

### Authentication & Portal

```php
// Get portal data
$portal = $this->getPortalData();

// Check if user is admin
if ($this->isAdmin()) {
    // Admin-only logic
}

// Get current user
$user = $this->getCurrentUser();
```

### Bitrix24 API Calls

```php
// Single API call
$result = $this->callBitrixMethod('crm.deal.get', ['id' => 123]);

// Batch API call
$commands = [
    'deal' => ['method' => 'crm.deal.get', 'params' => ['id' => 123]],
    'contact' => ['method' => 'crm.contact.get', 'params' => ['id' => 456]]
];
$results = $this->callBitrixBatch($commands);

// CRM operations
$deal = $this->getCrmEntity('deal', 123);
$updated = $this->updateCrmEntity('deal', 123, ['TITLE' => 'New Title']);
$this->addCrmComment('deal', 123, 'Processing completed');

// Task operations
$taskId = $this->createTask([
    'TITLE' => 'Follow up',
    'RESPONSIBLE_ID' => $user['ID']
]);

// Send notification
$this->sendNotification($userId, 'Task completed successfully');
```

### Settings Management

```php
// Get settings
$settings = $this->getSettings();           // All settings
$value = $this->getSettings('feature_x');   // Specific setting

// Save setting
$this->saveSetting('last_sync', date('Y-m-d H:i:s'));

// Check feature
if ($this->hasFeature('automation')) {
    // Feature-specific logic
}
```

### Event Data Access

```php
// Get all event data
$data = $this->getEventData();

// Get specific field
$dealId = $this->getEventField('ID');
$title = $this->getEventField('TITLE', 'Default Title');

// Access nested fields
$stageId = $this->getEventField('STAGE_ID');
$contactId = $this->getEventField('CONTACT_ID');
```

## CRM Event Handlers

### Deal Handler Example

```php
namespace Handlers\Events\CRM;

use Handlers\BaseHandler;

class DealUpdateHandler extends BaseHandler
{
    public function handle(): array
    {
        $dealId = $this->getEventField('ID');
        $oldFields = $this->getEventData()['FIELDS_BEFORE'] ?? [];
        $newFields = $this->getEventData()['FIELDS'] ?? [];
        
        // Check what changed
        if ($this->stageChanged($oldFields, $newFields)) {
            $this->handleStageChange($dealId, 
                $oldFields['STAGE_ID'] ?? '', 
                $newFields['STAGE_ID'] ?? ''
            );
        }
        
        // Check if deal won
        if ($newFields['STAGE_ID'] === 'WON') {
            $this->handleDealWon($dealId);
        }
        
        return [
            'success' => true,
            'data' => ['processed' => true]
        ];
    }
    
    private function stageChanged(array $old, array $new): bool
    {
        return ($old['STAGE_ID'] ?? '') !== ($new['STAGE_ID'] ?? '');
    }
    
    private function handleStageChange($dealId, $oldStage, $newStage): void
    {
        $this->logger->info('Deal stage changed', [
            'deal_id' => $dealId,
            'old_stage' => $oldStage,
            'new_stage' => $newStage
        ]);
        
        // Create task for manager
        $deal = $this->getCrmEntity('deal', $dealId);
        
        $this->createTask([
            'TITLE' => "Review deal: {$deal['TITLE']}",
            'DESCRIPTION' => "Deal moved from $oldStage to $newStage",
            'RESPONSIBLE_ID' => $deal['ASSIGNED_BY_ID']
        ]);
    }
    
    private function handleDealWon($dealId): void
    {
        // Send notification
        $deal = $this->getCrmEntity('deal', $dealId);
        $this->sendNotification(
            $deal['ASSIGNED_BY_ID'],
            "🎉 Congratulations! Deal '{$deal['TITLE']}' won!"
        );
        
        // Log success
        $this->logger->info('Deal won', [
            'deal_id' => $dealId,
            'amount' => $deal['OPPORTUNITY']
        ]);
    }
}
```

### Contact Handler Example

```php
namespace Handlers\Events\CRM;

use Handlers\BaseHandler;

class ContactAddHandler extends BaseHandler
{
    public function handle(): array
    {
        $contactId = $this->getEventField('ID');
        
        // Get full contact data
        $contact = $this->callBitrixMethod('crm.contact.get', [
            'id' => $contactId
        ]);
        
        if (!isset($contact['result'])) {
            return ['error' => true, 'message' => 'Contact not found'];
        }
        
        $contactData = $contact['result'];
        
        // Check for duplicates
        $this->checkDuplicates($contactData);
        
        // Send welcome email if has email
        if (!empty($contactData['EMAIL'])) {
            $this->sendWelcomeEmail($contactData);
        }
        
        // Create follow-up task
        $this->createFollowUpTask($contactData);
        
        return [
            'success' => true,
            'data' => ['contact_id' => $contactId]
        ];
    }
    
    private function checkDuplicates(array $contact): void
    {
        $duplicates = $this->callBitrixMethod('crm.duplicate.findbycomm', [
            'entity_type' => 'CONTACT',
            'type' => 'EMAIL',
            'values' => [$contact['EMAIL'][0]['VALUE'] ?? '']
        ]);
        
        if (!empty($duplicates['result']['CONTACT'])) {
            $this->logger->warning('Possible duplicate contact', [
                'new_id' => $contact['ID'],
                'existing_ids' => $duplicates['result']['CONTACT']
            ]);
        }
    }
    
    private function sendWelcomeEmail(array $contact): void
    {
        // Implementation depends on your email system
        $this->logger->info('Welcome email queued', [
            'contact_id' => $contact['ID'],
            'email' => $contact['EMAIL'][0]['VALUE']
        ]);
    }
    
    private function createFollowUpTask(array $contact): void
    {
        $deadline = date('c', strtotime('+3 days'));
        
        $this->createTask([
            'TITLE' => "Follow up with {$contact['NAME']} {$contact['LAST_NAME']}",
            'DESCRIPTION' => 'New contact requires follow-up',
            'DEADLINE' => $deadline,
            'RESPONSIBLE_ID' => $contact['ASSIGNED_BY_ID']
        ]);
    }
}
```

## Task Event Handlers

```php
namespace Handlers\Events\Task;

use Handlers\BaseHandler;

class TaskUpdateHandler extends BaseHandler
{
    public function handle(): array
    {
        $taskId = $this->getEventField('ID');
        $status = $this->getEventField('STATUS');
        
        // Check if task completed
        if ($status == 5) { // 5 = completed in Bitrix24
            $this->handleTaskCompletion($taskId);
        }
        
        // Check if overdue
        $deadline = $this->getEventField('DEADLINE');
        if ($deadline && strtotime($deadline) < time() && $status != 5) {
            $this->handleOverdueTask($taskId);
        }
        
        return ['success' => true];
    }
    
    private function handleTaskCompletion($taskId): void
    {
        $task = $this->callBitrixMethod('tasks.task.get', [
            'taskId' => $taskId
        ]);
        
        if (isset($task['result']['task'])) {
            $taskData = $task['result']['task'];
            
            // Notify creator
            $this->sendNotification(
                $taskData['createdBy'],
                "Task '{$taskData['title']}' completed by user #{$taskData['responsibleId']}"
            );
            
            // Log completion
            $this->logger->info('Task completed', [
                'task_id' => $taskId,
                'title' => $taskData['title']
            ]);
        }
    }
    
    private function handleOverdueTask($taskId): void
    {
        // Add urgent tag
        $this->callBitrixMethod('task.item.addtag', [
            'TASKID' => $taskId,
            'TAG' => 'OVERDUE'
        ]);
        
        $this->logger->warning('Task overdue', ['task_id' => $taskId]);
    }
}
```

## Error Handling

### Handler with Comprehensive Error Handling

```php
class RobustHandler extends BaseHandler
{
    public function handle(): array
    {
        try {
            // Validate input
            $entityId = $this->getEventField('ID');
            if (!$entityId) {
                throw new \InvalidArgumentException('Entity ID is required');
            }
            
            // Process with retry
            $result = $this->processWithRetry($entityId);
            
            return [
                'success' => true,
                'data' => $result
            ];
            
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 400);
            
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 503);
            
        } catch (\Exception $e) {
            $this->logger->error('Unexpected error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->errorResponse('Internal error', 500);
        }
    }
    
    private function processWithRetry($entityId, $attempts = 3): array
    {
        $lastError = null;
        
        for ($i = 0; $i < $attempts; $i++) {
            try {
                return $this->processEntity($entityId);
                
            } catch (\Exception $e) {
                $lastError = $e;
                $this->logger->warning('Processing attempt failed', [
                    'attempt' => $i + 1,
                    'error' => $e->getMessage()
                ]);
                
                if ($i < $attempts - 1) {
                    sleep(pow(2, $i)); // Exponential backoff
                }
            }
        }
        
        throw new \RuntimeException(
            'Processing failed after ' . $attempts . ' attempts: ' . $lastError->getMessage()
        );
    }
    
    private function errorResponse(string $message, int $code): array
    {
        return [
            'error' => true,
            'message' => $message,
            'code' => $code
        ];
    }
}
```

## Async Processing

For long-running operations, queue tasks:

```php
class AsyncHandler extends BaseHandler
{
    public function handle(): array
    {
        $data = $this->getEventData();
        
        // Save task to queue
        $this->queueTask($data);
        
        // Return immediately
        return [
            'success' => true,
            'message' => 'Task queued for processing'
        ];
    }
    
    private function queueTask(array $data): void
    {
        // Save to database queue
        $this->db->getConnection()->prepare(
            "INSERT INTO app_queue (type, data, status, created_at) 
             VALUES (?, ?, 'pending', NOW())"
        )->execute([
            'process_entity',
            json_encode($data)
        ]);
    }
}

// Separate worker process
class QueueWorker
{
    public function process(): void
    {
        $db = Database::getInstance();
        
        // Get pending tasks
        $tasks = $db->getConnection()->query(
            "SELECT * FROM app_queue 
             WHERE status = 'pending' 
             ORDER BY created_at ASC 
             LIMIT 10"
        )->fetchAll();
        
        foreach ($tasks as $task) {
            $this->processTask($task);
        }
    }
    
    private function processTask(array $task): void
    {
        // Update status
        $this->updateTaskStatus($task['id'], 'processing');
        
        try {
            // Process based on type
            $data = json_decode($task['data'], true);
            
            switch ($task['type']) {
                case 'process_entity':
                    $this->processEntity($data);
                    break;
                    
                // Other task types...
            }
            
            // Mark complete
            $this->updateTaskStatus($task['id'], 'completed');
            
        } catch (\Exception $e) {
            // Mark failed
            $this->updateTaskStatus($task['id'], 'failed', $e->getMessage());
        }
    }
}
```

## Testing Handlers

### Unit Testing

```php
use PHPUnit\Framework\TestCase;
use Handlers\Events\YourCustomHandler;

class YourCustomHandlerTest extends TestCase
{
    private $handler;
    
    protected function setUp(): void
    {
        // Mock request data
        $request = [
            'event' => 'ONCUSTOMEVENT',
            'auth' => [
                'domain' => 'test.bitrix24.com',
                'member_id' => 'test123',
                'application_token' => 'test_token',
                'access_token' => 'test',
                'refresh_token' => 'test'
            ],
            'data' => [
                'FIELDS' => [
                    'ID' => 123,
                    'TITLE' => 'Test Entity'
                ]
            ]
        ];
        
        $this->handler = new YourCustomHandler($request);
    }
    
    public function testHandleSuccess()
    {
        $result = $this->handler->handle();
        
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('data', $result);
    }
    
    public function testHandleInvalidData()
    {
        $request = [
            'event' => 'ONCUSTOMEVENT',
            'auth' => [...],
            'data' => [] // Empty data
        ];
        
        $handler = new YourCustomHandler($request);
        $result = $handler->handle();
        
        $this->assertTrue($result['error']);
        $this->assertEquals(400, $result['code']);
    }
}
```

### Manual Testing

```bash
# Test webhook directly
curl -X POST https://your-domain.com/api/webhook.php \
  -H "Content-Type: application/json" \
  -d '{
    "event": "ONCUSTOMEVENT",
    "auth": {
      "domain": "test.bitrix24.com",
      "member_id": "test123",
      "application_token": "test_token",
      "access_token": "test",
      "refresh_token": "test",
      "user_id": 1
    },
    "data": {
      "FIELDS": {
        "ID": 123,
        "TITLE": "Test"
      }
    }
  }'
```

## Best Practices

1. **Always validate input** - Check required fields exist
2. **Handle errors gracefully** - Use try-catch blocks
3. **Log important events** - For debugging and analytics
4. **Use transactions** - For multiple database operations
5. **Implement idempotency** - Handler can be called multiple times
6. **Keep handlers focused** - One responsibility per handler
7. **Use type hints** - For better IDE support and error catching
8. **Document complex logic** - Add PHPDoc comments
9. **Test thoroughly** - Unit tests and integration tests
10. **Monitor performance** - Log slow operations

## License Checking

By default, handlers check license status except for:
- InstallHandler
- UninstallHandler  
- LicenseHandler

To skip license check in custom handler:

```php
class PublicHandler extends BaseHandler
{
    protected function validateAuth(): bool
    {
        // Custom auth logic without license check
        return true;
    }
    
    public function handle(): array
    {
        // This will run even if license expired
    }
}
```

## Automatic License Checking

### ⚠️ Critical: Webhook Auto-Management

Every handler (except Install/Uninstall/License) automatically:

1. **Checks license status**
2. **Unregisters webhooks if expired** (NEW!)
3. **Returns 402 Payment Required**
```php
// This happens automatically in BaseHandler::process()
if (!$licenseStatus['is_valid']) {
    // NEW: Automatic webhook cleanup
    $this->handleExpiredLicense($licenseStatus);
    // Webhooks are now unregistered!
    Response::error('License expired', 402);
}
```

## Performance Optimization

```php
class OptimizedHandler extends BaseHandler
{
    public function handle(): array
    {
        // Use batch operations
        $entityIds = [1, 2, 3, 4, 5];
        $commands = [];
        
        foreach ($entityIds as $id) {
            $commands["deal_$id"] = [
                'method' => 'crm.deal.get',
                'params' => ['id' => $id]
            ];
        }
        
        // Single batch call instead of 5 individual calls
        $results = $this->callBitrixBatch($commands);
        
        // Cache frequently used data
        $cacheKey = "portal_settings_{$this->portal['id']}";
        $settings = $this->getCached($cacheKey, function() {
            return $this->getSettings();
        }, 3600);
        
        return ['success' => true];
    }
    
    private function getCached(string $key, callable $callback, int $ttl = 3600)
    {
        // Check cache
        $cached = $this->db->getConnection()
            ->prepare("SELECT cache_value FROM app_cache WHERE cache_key = ? AND expires_at > NOW()")
            ->execute([$key])
            ->fetch();
        
        if ($cached) {
            return json_decode($cached['cache_value'], true);
        }
        
        // Generate and cache
        $value = $callback();
        
        $this->db->getConnection()
            ->prepare("REPLACE INTO app_cache (cache_key, cache_value, expires_at) VALUES (?, ?, ?)")
            ->execute([
                $key,
                json_encode($value),
                date('Y-m-d H:i:s', time() + $ttl)
            ]);
        
        return $value;
    }
}
```