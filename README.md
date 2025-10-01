<!-- README.md -->
# Bitrix24 App Template

Universal template for creating Bitrix24 applications with modern architecture and built-in licensing system.

## 🚀 Quick Start

1. **Clone template** → Copy files to your server
2. **Configure** → Copy `.env.example` to `.env` and fill in your credentials
3. **Register in Bitrix24** → Add application URL: `https://your-domain.com/install/`
4. **Install** → Click "Install" in Bitrix24 marketplace

## 📋 What's Included

### Core Features
- ✅ **Auto-installation** - Automatic setup with event handlers registration
- ✅ **License Management** - 14-day trial + paid license activation
- ✅ **Token Management** - Automatic refresh of expired tokens
- ✅ **Database** - Auto-creation of tables, never deletes portal data
- ✅ **REST API** - Ready endpoints for Vue.js/React frontend
- ✅ **Diagnostics** - Complete system analysis and monitoring
- ✅ **Logging** - Comprehensive error tracking and debugging

### Architecture
```
├── public/          → Web accessible files
│   ├── install/     → Installation interface
│   ├── api/         → API endpoints (webhook, REST, health)
│   └── index.php    → Main application entry
│
├── backend/         → Business logic
│   ├── config/      → Configuration files
│   ├── lib/         → Core libraries (Database, Logger, CRest)
│   └── handlers/    → Event handlers
│
└── storage/         → Logs and temporary files
```

## 💡 Key Concepts

### Portal Management
- **Never delete portals** - Deactivate only to prevent trial abuse
- **member_id** - Unique portal identifier that never changes
- **Trial tracking** - Each portal can use trial only once

### License System
- **14-day trial** - Automatic for new installations
- **License activation** - Via license key (format: XXXX-XXXX-XXXX-XXXX)
- **Auto-blocking** - When trial expires without license
- **Grace period** - Portal data preserved for reactivation

### Event Handling
- **Webhook endpoint** - `/api/webhook.php` for all Bitrix24 events
- **Auto-registration** - Handlers registered during installation
- **Smart routing** - Events mapped to handler classes via `routes.php`

### API & Security
- **Token refresh** - Automatic when expired
- **Rate limiting** - Monitoring and prevention (120 calls/minute)
- **Authentication** - Via application_token for each portal
- **CORS support** - For frontend applications

## 🛠 Development

### Creating New Handler
```php
// backend/handlers/events/YourHandler.php
class YourHandler extends BaseHandler {
    public function handle(): array {
        // Your logic here
        return ['success' => true];
    }
}
```

### Adding API Endpoint
```php
// Add to public/api/rest.php switch statement
case 'your/endpoint':
    // Your logic
    Response::success($data);
    break;
```

### Using Bitrix24 API
```php
// Automatic token management
$result = $this->callBitrixMethod('crm.deal.get', ['id' => 123]);
```

## 📊 Monitoring

### Health Check
- **Endpoint**: `/api/health.php`
- **Purpose**: System status for monitoring tools
- **Checks**: Database, filesystem, PHP, memory, disk space

### Diagnostics Dashboard
- **Location**: Main app → Diagnostics tab
- **Features**: Event handlers, permissions, storage, errors
- **Testing**: API connection, database, webhooks

### Statistics Dashboard
- **URL**: `/stats.html`
- **Real-time**: API calls monitoring
- **Metrics**: Success rate, response time, rate limits
- **Export**: JSON/CSV for analysis

## 🔧 Configuration

### Environment Variables
```env
DB_NAME=your_database
DB_USER=your_user
DB_PASS=your_password
BITRIX_APP_ID=your_app_id
BITRIX_APP_SECRET=your_app_secret
```

### Database Tables
- `app_portals` - Portal credentials and licenses
- `app_settings` - Portal-specific settings
- `app_logs` - System and error logs
- `app_api_calls` - Slow/failed API calls tracking

## 📝 Important Notes

1. **Portal data is permanent** - Never deleted, only deactivated
2. **Trial is one-time** - Cannot be reused after uninstall
3. **Tokens auto-refresh** - No manual intervention needed
4. **Rate limits monitored** - Automatic warnings at 80% usage
5. **All events logged** - For debugging and analysis

## 🚦 Production Checklist

- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Configure proper database credentials
- [ ] Set up SSL certificate (HTTPS required)
- [ ] Configure backup strategy for database
- [ ] Set up monitoring for `/api/health.php`
- [ ] Review and adjust rate limiting settings
- [ ] Test license activation flow
- [ ] Configure log rotation

## 🆘 Troubleshooting

### Installation Issues
- Check `/storage/logs/` for errors
- Verify Bitrix24 app credentials
- Ensure database permissions

### License Problems
- Check portal status in database
- Verify license key format
- Review `trial_used` flag

### API Errors
- Monitor rate limits in diagnostics
- Check token expiration
- Review `/api/stats.php` for patterns

## 🔄 Automatic Webhook Management

The application automatically manages Bitrix24 webhooks to prevent unnecessary server load:

- **Auto-unregistration**: Webhooks are automatically removed when license/trial expires
- **Auto-restoration**: Webhooks are restored when license is activated
- **Daily cleanup**: Cron job checks and cleans up expired portals
- **Zero manual intervention**: Fully automated process

See [CRON_SETUP.md](docs/CRON_SETUP.md) for configuration details.

## 📚 Further Documentation

- [Installation Guide](docs/installation.md)
- [License System](docs/licensing.md)
- [API Reference](docs/api.md)
- [Event Handlers](docs/handlers.md)
- [Database Schema](docs/database.md)
- [Troubleshooting](docs/troubleshooting.md)

## 📄 License

This template is open source. Customize for your needs.

## 🤝 Support

For issues or questions:
1. Check diagnostics dashboard first
2. Review logs in `/storage/logs/`
3. Use health check endpoint for system status

---

**Version**: 1.0.0  
**PHP Required**: 7.4+  
**Bitrix24 API**: REST  
**Database**: MySQL 5.7+