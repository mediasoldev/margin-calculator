# Deployment Documentation

## Overview

This guide covers deploying the Bitrix24 application to production, including server requirements, deployment strategies, optimization, and maintenance procedures.

## Server Requirements

### Minimum Requirements

- **PHP**: 7.4+ (8.0+ recommended)
- **MySQL**: 5.7+ or MariaDB 10.3+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 10GB minimum
- **SSL Certificate**: Required for HTTPS

### PHP Extensions Required

```bash
# Check required extensions
php -m | grep -E "pdo|pdo_mysql|curl|json|mbstring|openssl|session|fileinfo"

# Install missing extensions (Ubuntu/Debian)
sudo apt-get install php8.0-mysql php8.0-curl php8.0-json php8.0-mbstring php8.0-xml
```

### Recommended PHP Configuration

```ini
; php.ini production settings
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
post_max_size = 50M
upload_max_filesize = 50M
max_input_vars = 10000

; Security
expose_php = Off
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log

; Session
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_only_cookies = 1
session.use_strict_mode = 1

; OPcache
opcache.enable = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 20000
opcache.revalidate_freq = 60
opcache.fast_shutdown = 1
```

## Pre-Deployment Checklist

```bash
# 1. Environment preparation
[ ] Server meets minimum requirements
[ ] SSL certificate installed and configured
[ ] Domain DNS configured
[ ] Firewall rules configured
[ ] Backup system configured

# 2. Application preparation
[ ] Production .env file created
[ ] Database credentials secured
[ ] Bitrix24 app registered
[ ] Client ID and Secret obtained
[ ] License server configured (if applicable)

# 3. Security
[ ] Strong passwords set
[ ] SSH key authentication enabled
[ ] Firewall configured
[ ] Fail2ban installed
[ ] Security headers configured
```

## Deployment Methods

### Method 1: Git Deployment

```bash
# 1. Clone repository
cd /var/www
git clone https://github.com/your-repo/bitrix24-app.git
cd bitrix24-app

# 2. Set permissions
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 storage/

# 3. Install dependencies (if using Composer)
composer install --no-dev --optimize-autoloader

# 4. Configure environment
cp .env.example .env
nano .env  # Edit configuration

# 5. Set up database
mysql -u root -p -e "CREATE DATABASE bitrix_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'bitrix_user'@'localhost' IDENTIFIED BY 'strong_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON bitrix_app.* TO 'bitrix_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# 6. Test application
php -S localhost:8000 -t public/
```

### Method 2: Docker Deployment

```dockerfile
# Dockerfile
FROM php:8.0-fpm

# Install extensions
RUN docker-php-ext-install pdo_mysql json mbstring

# Install additional packages
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    nginx \
    supervisor

# Copy application
COPY . /var/www/html
WORKDIR /var/www/html

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 775 /var/www/html/storage

# Copy configs
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    container_name: bitrix24-app
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www/html
      - ./storage:/var/www/html/storage
    environment:
      - DB_HOST=db
      - DB_NAME=bitrix_app
      - DB_USER=bitrix_user
      - DB_PASS=secure_password
    depends_on:
      - db
    networks:
      - bitrix-network

  db:
    image: mysql:8.0
    container_name: bitrix24-db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: bitrix_app
      MYSQL_USER: bitrix_user
      MYSQL_PASSWORD: secure_password
      MYSQL_ROOT_PASSWORD: root_password
    volumes:
      - dbdata:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - bitrix-network

  redis:
    image: redis:alpine
    container_name: bitrix24-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - bitrix-network

volumes:
  dbdata:

networks:
  bitrix-network:
    driver: bridge
```

```bash
# Deploy with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Enter container
docker-compose exec app bash
```

### Method 3: Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

# Configuration
APP_DIR="/var/www/bitrix24-app"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENVIRONMENT="production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment...${NC}"

# 1. Backup current version
if [ -d "$APP_DIR" ]; then
    echo "Creating backup..."
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" .
fi

# 2. Pull latest code
echo "Pulling latest code..."
cd $APP_DIR
git fetch origin
git reset --hard origin/main

# 3. Install/update dependencies
if [ -f "composer.json" ]; then
    echo "Installing dependencies..."
    composer install --no-dev --optimize-autoloader
fi

# 4. Run migrations
echo "Running database migrations..."
php artisan migrate --force

# 5. Clear caches
echo "Clearing caches..."
rm -rf storage/cache/*
php artisan cache:clear 2>/dev/null || true

# 6. Set permissions
echo "Setting permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/storage

# 7. Optimize application
echo "Optimizing application..."
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# 8. Restart services
echo "Restarting services..."
systemctl reload php8.0-fpm
systemctl reload nginx

# 9. Health check
echo "Running health check..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/health.php)

if [ $HEALTH_CHECK -eq 200 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
else
    echo -e "${RED}Health check failed! Rolling back...${NC}"
    # Rollback logic here
    tar -xzf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR"
    exit 1
fi

echo -e "${GREEN}Deployment completed at $(date)${NC}"
```

## Web Server Configuration

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/bitrix24-app
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    root /var/www/bitrix24-app/public;
    index index.php index.html;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logging
    access_log /var/log/nginx/bitrix24-app_access.log;
    error_log /var/log/nginx/bitrix24-app_error.log;
    
    # PHP Configuration
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_busy_buffers_size 256k;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to sensitive files
    location ~ \.(env|log|sql)$ {
        deny all;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # Default location
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/javascript application/x-javascript application/x-font-ttf application/vnd.ms-fontobject font/opentype;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=2r/s;
limit_conn_zone $binary_remote_addr zone=addr:10m;
```

### Apache Configuration

```apache
# .htaccess or httpd.conf
<VirtualHost *:443>
    ServerName your-domain.com
    DocumentRoot /var/www/bitrix24-app/public
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/your-domain.crt
    SSLCertificateKeyFile /etc/ssl/private/your-domain.key
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000"
    
    # Directory Configuration
    <Directory /var/www/bitrix24-app/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # PHP Configuration
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/var/run/php/php8.0-fpm.sock|fcgi://localhost"
    </FilesMatch>
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss
    </IfModule>
    
    # Caching
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 1 month"
        ExpiresByType image/jpeg "access plus 1 month"
        ExpiresByType image/gif "access plus 1 month"
        ExpiresByType image/png "access plus 1 month"
        ExpiresByType text/css "access plus 1 week"
        ExpiresByType application/javascript "access plus 1 week"
    </IfModule>
    
    # Deny access to sensitive files
    <FilesMatch "\.(env|log|sql)$">
        Order Allow,Deny
        Deny from all
    </FilesMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/bitrix24-app_error.log
    CustomLog ${APACHE_LOG_DIR}/bitrix24-app_access.log combined
</VirtualHost>
```

## Database Setup

### Production Database Configuration

```sql
-- Create database and user
CREATE DATABASE bitrix_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bitrix_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON bitrix_app.* TO 'bitrix_user'@'localhost';
FLUSH PRIVILEGES;

-- Optimize for production
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 134217728; -- 128MB
```

### Database Backup Strategy

```bash
#!/bin/bash
# backup_database.sh

DB_NAME="bitrix_app"
DB_USER="bitrix_user"
DB_PASS="SecurePassword123!"
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mysqldump -u $DB_USER -p$DB_PASS --single-transaction --routines --triggers $DB_NAME | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-backup-bucket/mysql/
```

## SSL Certificate Setup

### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (add to crontab)
0 2 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
```

### Commercial SSL Certificate

```bash
# Generate CSR
openssl req -new -newkey rsa:2048 -nodes -keyout your-domain.key -out your-domain.csr

# After receiving certificate from CA
cat your-domain.crt intermediate.crt > bundle.crt

# Install certificate
sudo cp bundle.crt /etc/ssl/certs/
sudo cp your-domain.key /etc/ssl/private/
sudo chmod 600 /etc/ssl/private/your-domain.key
```

## Environment Configuration

### Production .env File

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_TIMEZONE=UTC

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bitrix_app
DB_USER=bitrix_user
DB_PASS=SecurePassword123!
DB_CHARSET=utf8mb4

# Bitrix24
BITRIX_APP_ID=your.production.client.id
BITRIX_APP_SECRET=your.production.client.secret

# Security
ENCRYPTION_KEY=base64:generated_32_char_key_here
SESSION_LIFETIME=7200
CORS_ORIGINS=https://*.bitrix24.com

# Logging
LOG_LEVEL=warning
LOG_PATH=storage/logs

# Cache
CACHE_ENABLED=true
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Email
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

### Environment Security

```bash
# Secure .env file
chmod 600 .env
chown www-data:www-data .env

# Prevent web access to .env
echo "Deny from all" > .env.htaccess
```

## Monitoring Setup

### System Monitoring

```bash
# Install monitoring tools
sudo apt-get install htop iotop netdata

# Configure Netdata
sudo systemctl enable netdata
sudo systemctl start netdata

# Access at http://your-server:19999
```

### Application Monitoring

```php
// health_check.php - for monitoring services
<?php
require_once 'backend/bootstrap.php';

$checks = [];

// Database check
try {
    $db = Database::getInstance();
    $db->getConnection()->query('SELECT 1');
    $checks['database'] = 'OK';
} catch (Exception $e) {
    $checks['database'] = 'FAIL';
    http_response_code(503);
}

// Redis check (if using)
try {
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);
    $redis->ping();
    $checks['redis'] = 'OK';
} catch (Exception $e) {
    $checks['redis'] = 'FAIL';
}

// Disk space check
$free = disk_free_space('/');
$total = disk_total_space('/');
$percent = round(($total - $free) / $total * 100);
$checks['disk'] = $percent < 80 ? 'OK' : 'WARNING';

// Response
header('Content-Type: application/json');
echo json_encode([
    'status' => in_array('FAIL', $checks) ? 'ERROR' : 'OK',
    'checks' => $checks,
    'timestamp' => time()
]);
```

### Log Monitoring

```bash
# Install log monitoring
sudo apt-get install logwatch

# Configure logwatch
sudo nano /etc/logwatch/conf/logwatch.conf
# Output = mail
# MailTo = admin@your-domain.com
# Detail = High

# Monitor logs in real-time
tail -f /var/www/bitrix24-app/storage/logs/*.log
```

## Performance Optimization

### PHP-FPM Tuning

```ini
; /etc/php/8.0/fpm/pool.d/www.conf
pm = dynamic
pm.max_children = 50
pm.start_servers = 10
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
pm.process_idle_timeout = 10s
request_terminate_timeout = 300
```

### MySQL Optimization

```ini
# /etc/mysql/my.cnf
[mysqld]
# InnoDB
innodb_buffer_pool_size = 2G
innodb_log_file_size = 512M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# Query cache
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 4M

# Connections
max_connections = 300
max_allowed_packet = 64M

# Temp tables
tmp_table_size = 256M
max_heap_table_size = 256M
```

### Redis Configuration

```conf
# /etc/redis/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Maintenance Tasks

### Automated Maintenance

```bash
#!/bin/bash
# maintenance.sh - Run daily via cron

# Variables
APP_DIR="/var/www/bitrix24-app"
LOG_FILE="/var/log/bitrix24-maintenance.log"

echo "$(date) - Starting maintenance" >> $LOG_FILE

# 1. Clean old logs
find $APP_DIR/storage/logs -name "*.log" -mtime +30 -delete

# 2. Clean old cache
find $APP_DIR/storage/cache -type f -mtime +7 -delete

# 3. Optimize database
mysql -u bitrix_user -p'SecurePassword123!' bitrix_app -e "
    DELETE FROM app_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
    DELETE FROM app_api_calls WHERE created_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
    OPTIMIZE TABLE app_logs, app_api_calls, app_cache;
"

# 4. Backup database
/path/to/backup_database.sh

# 5. Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date) - WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
    # Send alert email
    echo "Disk usage is ${DISK_USAGE}% on $(hostname)" | mail -s "Disk Space Alert" admin@your-domain.com
fi

echo "$(date) - Maintenance completed" >> $LOG_FILE
```

### Cron Jobs

```bash
# Add to crontab (crontab -e)

# Daily maintenance at 2 AM
0 2 * * * /path/to/maintenance.sh

# Database backup every 6 hours
0 */6 * * * /path/to/backup_database.sh

# Clean expired cache every hour
0 * * * * php /var/www/bitrix24-app/artisan cache:clear-expired

# Monitor health every 5 minutes
*/5 * * * * curl -s https://your-domain.com/api/health.php || echo "Health check failed" | mail -s "Health Alert" admin@your-domain.com

# Log rotation
0 0 * * 0 /usr/sbin/logrotate /etc/logrotate.d/bitrix24-app
```

## Rollback Procedure

### Rollback Script

```bash
#!/bin/bash
# rollback.sh

BACKUP_DIR="/backups"
APP_DIR="/var/www/bitrix24-app"

# List available backups
echo "Available backups:"
ls -la $BACKUP_DIR/*.tar.gz | tail -10

echo "Enter backup filename to restore:"
read BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Backup file not found!"
    exit 1
fi

echo "Rolling back to $BACKUP_FILE..."

# Stop services
systemctl stop nginx
systemctl stop php8.0-fpm

# Backup current state
tar -czf "$BACKUP_DIR/rollback_$(date +%Y%m%d_%H%M%S).tar.gz" -C "$APP_DIR" .

# Restore backup
rm -rf $APP_DIR/*
tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$APP_DIR"

# Set permissions
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR
chmod -R 775 $APP_DIR/storage

# Start services
systemctl start php8.0-fpm
systemctl start nginx

echo "Rollback completed!"
```

## Security Hardening

### Server Security

```bash
# 1. Install security tools
sudo apt-get install fail2ban ufw

# 2. Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable

# 3. Configure fail2ban
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22

[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

[nginx-noproxy]
enabled = true
```

### Application Security

```bash
# 1. Set secure file permissions
find /var/www/bitrix24-app -type f -exec chmod 644 {} \;
find /var/www/bitrix24-app -type d -exec chmod 755 {} \;
chmod -R 775 /var/www/bitrix24-app/storage

# 2. Disable unnecessary services
systemctl disable bluetooth
systemctl disable cups

# 3. Regular security updates
apt-get update && apt-get upgrade
```

## Post-Deployment Testing

### Functional Testing

```bash
# Test all endpoints
curl -I https://your-domain.com
curl https://your-domain.com/api/health.php
curl -X POST https://your-domain.com/api/webhook.php -d '{"test":true}'

# Test SSL
openssl s_client -connect your-domain.com:443

# Test from Bitrix24
# 1. Install application
# 2. Test all features
# 3. Check event handlers
# 4. Verify license system
```

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test load capacity
ab -n 1000 -c 100 https://your-domain.com/api/health.php

# Monitor during test
htop
tail -f /var/log/nginx/access.log
```

## Troubleshooting Deployment

### Common Issues

```bash
# 1. Permission issues
sudo chown -R www-data:www-data /var/www/bitrix24-app
sudo chmod -R 755 /var/www/bitrix24-app

# 2. 502 Bad Gateway
sudo systemctl restart php8.0-fpm
sudo systemctl restart nginx

# 3. Database connection issues
mysql -u bitrix_user -p bitrix_app -e "SELECT 1"

# 4. Check logs
tail -f /var/log/nginx/error.log
tail -f /var/www/bitrix24-app/storage/logs/*.log

# 5. Clear caches
rm -rf /var/www/bitrix24-app/storage/cache/*
```

## Production Checklist

```markdown
## Pre-Launch
- [ ] SSL certificate installed and working
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] Error reporting disabled
- [ ] Debug mode disabled
- [ ] Caching enabled
- [ ] CDN configured (optional)
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Firewall configured
- [ ] Fail2ban configured
- [ ] Log rotation configured

## Post-Launch
- [ ] Test all functionality
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify backup system
- [ ] Test rollback procedure
- [ ] Document any issues
- [ ] Update documentation
- [ ] Notify team of deployment

## Production Checklist

### Webhook Management Setup
- [ ] Cron job configured for check_expired_licenses.php
- [ ] WebhookManager.php deployed
- [ ] Database has webhook management columns
- [ ] Test webhook unregistration on test portal
- [ ] Test webhook restoration on license activation
- [ ] Admin email configured for reports
- [ ] Log rotation includes webhook logs

```

## Continuous Deployment (CI/CD)

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/bitrix24-app
          git pull origin main
          composer install --no-dev
          php artisan migrate --force
          php artisan cache:clear
          systemctl reload php8.0-fpm
```

## Conclusion

Successful deployment requires careful planning, proper configuration, and ongoing maintenance. Follow this guide and adapt it to your specific needs. Always test thoroughly before going live and maintain regular backups.