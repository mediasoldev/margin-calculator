<?php
/**
 * Event routing configuration
 * Maps Bitrix24 events to handler classes
 */

return [
    // Application lifecycle events
    'onappinstall' => \Handlers\Events\InstallHandler::class,
    'onappuninstall' => \Handlers\Events\UninstallHandler::class,
    'onappupdate' => \Handlers\Events\UpdateHandler::class,
    
    // License management
    'license' => \Handlers\Events\LicenseHandler::class,
    'onlicense' => \Handlers\Events\LicenseHandler::class,
    
    // CRM Deal events
    'oncrmdealupdate' => \Handlers\Events\CRM\DealUpdateHandler::class,
    'oncrmdealadd' => \Handlers\Events\CRM\DealAddHandler::class,
    'oncrmdealdelete' => \Handlers\Events\CRM\DealDeleteHandler::class,
    
    // CRM Contact events
    'oncrmcontactupdate' => \Handlers\Events\CRM\ContactUpdateHandler::class,
    'oncrmcontactadd' => \Handlers\Events\CRM\ContactAddHandler::class,
    'oncrmcontactdelete' => \Handlers\Events\CRM\ContactDeleteHandler::class,
    
    // CRM Company events
    'oncrmcompanyupdate' => \Handlers\Events\CRM\CompanyUpdateHandler::class,
    'oncrmcompanyadd' => \Handlers\Events\CRM\CompanyAddHandler::class,
    'oncrmcompanydelete' => \Handlers\Events\CRM\CompanyDeleteHandler::class,
    
    // CRM Lead events
    'oncrmleadupdate' => \Handlers\Events\CRM\LeadUpdateHandler::class,
    'oncrmleadadd' => \Handlers\Events\CRM\LeadAddHandler::class,
    'oncrmleaddelete' => \Handlers\Events\CRM\LeadDeleteHandler::class,
    
    // Task events
    'ontaskupdate' => \Handlers\Events\Task\TaskUpdateHandler::class,
    'ontaskadd' => \Handlers\Events\Task\TaskAddHandler::class,
    'ontaskdelete' => \Handlers\Events\Task\TaskDeleteHandler::class,
    
    // User events
    'onuserupdate' => \Handlers\Events\User\UserUpdateHandler::class,
    'onuseradd' => \Handlers\Events\User\UserAddHandler::class,
    
    // Custom events
    'oncustomevent' => \Handlers\Events\CustomEventHandler::class,
    'diagnostics' => \Handlers\Events\DiagnosticsHandler::class,
    
    // Default handler for unknown events
    'default' => \Handlers\Events\DefaultHandler::class,
];