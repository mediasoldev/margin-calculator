<?php

namespace Handlers\Events;

use Handlers\BaseHandler;

/**
 * Default handler for unknown events
 */
class DefaultHandler extends BaseHandler
{
    /**
     * Handle unknown event
     */
    public function handle(): array
    {
        $event = $this->request['event'] ?? 'unknown';
        $data = $this->getEventData();
        
        // Log the unknown event
        $this->logger->warning('Unknown event received', [
            'event' => $event,
            'domain' => $this->domain,
            'data' => $data,
            'auth' => [
                'user_id' => $this->auth['user_id'] ?? null,
                'member_id' => $this->auth['member_id'] ?? null
            ]
        ]);
        
        // You can add custom logic here to handle unknown events
        // For example, save them to database for analysis
        $this->saveUnknownEvent($event, $data);
        
        return [
            'success' => true,
            'message' => "Event '$event' received but no handler configured",
            'data' => [
                'event' => $event,
                'timestamp' => date('Y-m-d H:i:s')
            ]
        ];
    }
    
    /**
     * Save unknown event for analysis
     */
    private function saveUnknownEvent(string $event, array $data): void
    {
        try {
            if ($this->portal && $this->db) {
                // Save event to settings or separate table
                $unknownEvents = $this->getSettings('unknown_events');
                $events = $unknownEvents['unknown_events'] ?? '[]';
                
                if (is_string($events)) {
                    $events = json_decode($events, true) ?? [];
                }
                
                // Add new event (keep last 100 events)
                $events[] = [
                    'event' => $event,
                    'timestamp' => date('Y-m-d H:i:s'),
                    'user_id' => $this->auth['user_id'] ?? null,
                    'data_keys' => array_keys($data)
                ];
                
                // Keep only last 100 events
                if (count($events) > 100) {
                    $events = array_slice($events, -100);
                }
                
                $this->saveSetting('unknown_events', json_encode($events));
            }
        } catch (\Exception $e) {
            $this->logger->error('Failed to save unknown event', [
                'event' => $event,
                'error' => $e->getMessage()
            ]);
        }
    }
}