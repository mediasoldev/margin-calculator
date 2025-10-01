# Frontend Integration Documentation

## Overview

The application supports modern frontend frameworks like Vue.js, React, and vanilla JavaScript. The backend provides REST API endpoints and passes necessary data to the frontend through global variables.

## Architecture

```
Bitrix24 iframe → index.php → Pass APP_DATA → index.html → JavaScript Framework
                      ↓                           ↓
                 Prepare data               Load BX24 SDK
                      ↓                           ↓
                 Authentication            Initialize App
                      ↓                           ↓
                 License Check              API Calls
```

## Initial Setup

### Data Flow from PHP to Frontend

```php
// public/index.php
<?php
// Prepare data for frontend
$appData = [
    'domain' => $params['DOMAIN'],
    'protocol' => $params['PROTOCOL'] === '1',
    'lang' => $params['LANG'],
    'app_sid' => $params['APP_SID'],
    'auth_id' => $params['AUTH_ID'],
    'auth_expires' => $params['AUTH_EXPIRES'],
    'refresh_id' => $params['REFRESH_ID'],
    'member_id' => $portal['member_id'],
    'user_id' => $params['USER_ID'],
    'placement' => $params['PLACEMENT'],
    'placement_options' => $params['PLACEMENT_OPTIONS'],
    'is_admin' => false, // Determined by JS
    'settings' => $settings,
    'api_endpoint' => '/api/rest.php',
    'license_status' => $licenseStatus,
    'is_trial' => (bool)$portal['is_trial'],
    'has_license' => !empty($portal['license_key'])
];
?>

<!DOCTYPE html>
<html>
<head>
    <script>
        // Pass data to JavaScript
        window.APP_DATA = <?php echo json_encode($appData); ?>;
    </script>
    
    <!-- Bitrix24 JS SDK -->
    <script src="//api.bitrix24.com/api/v1/"></script>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

## Bitrix24 SDK Integration

### Initialization

```javascript
// Initialize BX24 SDK
BX24.init(function() {
    console.log('BX24 initialized');
    
    // Get current user
    BX24.callMethod('user.current', {}, function(result) {
        if (result.error()) {
            console.error('Error:', result.error());
            return;
        }
        
        const user = result.data();
        window.APP_DATA.current_user = user;
        window.APP_DATA.is_admin = user.ADMIN || false;
        
        // Initialize your app
        initializeApp();
    });
    
    // Auto-resize iframe
    BX24.fitWindow();
    
    // Get placement info
    const placement = BX24.placement.info();
    console.log('Placement:', placement);
});
```

### Common BX24 Methods

```javascript
// Resize window
BX24.fitWindow();

// Open path in Bitrix24
BX24.openPath('/crm/deal/details/123/');

// Open application
BX24.openApplication({
    'ID': 123,
    'PARAMS': {'param': 'value'}
});

// Close application
BX24.closeApplication();

// Show/hide loading
BX24.showLoading();
BX24.hideLoading();

// Get scroll position
const scrollPos = BX24.getScrollSize();

// Proxy URL (for external resources)
const proxyUrl = BX24.proxyUrl('https://external-site.com/image.jpg');

// Install/uninstall events
BX24.installFinish();
BX24.uninstallFinish();

// Placement specific
BX24.placement.call('getStatus', {}, function(result) {
    console.log('Placement status:', result);
});
```

## Vue.js Integration

### Vue 3 Setup

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <script>window.APP_DATA = <?php echo json_encode($appData); ?>;</script>
    <script src="//api.bitrix24.com/api/v1/"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
</head>
<body>
    <div id="app">
        <app-component></app-component>
    </div>
    
    <script src="js/app.js"></script>
</body>
</html>
```

```javascript
// js/app.js
const { createApp } = Vue;

// API Service
const ApiService = {
    baseURL: '/api/rest.php',
    
    async request(endpoint, options = {}) {
        const response = await fetch(this.baseURL + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + window.APP_DATA.app_sid,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    },
    
    async getPortalSettings() {
        return this.request('/portal/settings?domain=' + window.APP_DATA.domain);
    },
    
    async saveSettings(key, value) {
        return this.request('/portal/settings', {
            method: 'POST',
            body: JSON.stringify({
                domain: window.APP_DATA.domain,
                key: key,
                value: value
            })
        });
    },
    
    async callBitrixMethod(method, params) {
        return this.request('/bitrix/call', {
            method: 'POST',
            body: JSON.stringify({
                domain: window.APP_DATA.domain,
                method: method,
                params: params
            })
        });
    }
};

// Main Component
const AppComponent = {
    template: `
        <div class="container">
            <div class="header">
                <h1>{{ appName }}</h1>
                <div class="user-info">
                    {{ currentUser.NAME }} {{ currentUser.LAST_NAME }}
                    <span v-if="isAdmin" class="badge">Admin</span>
                </div>
            </div>
            
            <div class="license-status" :class="licenseClass">
                <span v-if="isTrial">
                    Trial: {{ daysRemaining }} days remaining
                </span>
                <span v-else-if="hasLicense">
                    Licensed until {{ licenseExpiry }}
                </span>
                <span v-else>
                    License required
                </span>
            </div>
            
            <div class="tabs">
                <button 
                    v-for="tab in tabs" 
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="{ active: activeTab === tab.id }"
                >
                    {{ tab.label }}
                </button>
            </div>
            
            <div class="content">
                <component :is="activeTabComponent"></component>
            </div>
        </div>
    `,
    
    data() {
        return {
            appData: window.APP_DATA,
            appName: 'Bitrix24 App',
            currentUser: {},
            activeTab: 'dashboard',
            tabs: [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'settings', label: 'Settings' },
                { id: 'reports', label: 'Reports' }
            ],
            settings: {},
            loading: false
        };
    },
    
    computed: {
        isAdmin() {
            return this.appData.is_admin || false;
        },
        
        isTrial() {
            return this.appData.is_trial || false;
        },
        
        hasLicense() {
            return this.appData.has_license || false;
        },
        
        daysRemaining() {
            return this.appData.license_status?.days_remaining || 0;
        },
        
        licenseExpiry() {
            if (this.appData.license_valid_until) {
                return new Date(this.appData.license_valid_until).toLocaleDateString();
            }
            return 'N/A';
        },
        
        licenseClass() {
            if (this.hasLicense) return 'licensed';
            if (this.isTrial && this.daysRemaining > 3) return 'trial';
            if (this.isTrial && this.daysRemaining <= 3) return 'trial-expiring';
            return 'expired';
        },
        
        activeTabComponent() {
            return this.activeTab + '-component';
        }
    },
    
    mounted() {
        this.initialize();
    },
    
    methods: {
        async initialize() {
            // Initialize BX24
            BX24.init(() => {
                console.log('BX24 initialized');
                BX24.fitWindow();
                
                // Get current user
                BX24.callMethod('user.current', {}, (result) => {
                    if (!result.error()) {
                        this.currentUser = result.data();
                        this.appData.is_admin = this.currentUser.ADMIN || false;
                    }
                });
            });
            
            // Load settings
            await this.loadSettings();
        },
        
        async loadSettings() {
            try {
                this.loading = true;
                const response = await ApiService.getPortalSettings();
                if (response.success) {
                    this.settings = response.data.settings;
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                this.loading = false;
            }
        },
        
        async saveSetting(key, value) {
            try {
                const response = await ApiService.saveSettings(key, value);
                if (response.success) {
                    this.$notify('Settings saved successfully');
                }
            } catch (error) {
                console.error('Failed to save setting:', error);
                this.$notify('Failed to save settings', 'error');
            }
        },
        
        $notify(message, type = 'success') {
            // Implement notification logic
            console.log(`[${type}] ${message}`);
        }
    }
};

// Dashboard Component
const DashboardComponent = {
    template: `
        <div class="dashboard">
            <h2>Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card" v-for="stat in stats" :key="stat.id">
                    <div class="stat-value">{{ stat.value }}</div>
                    <div class="stat-label">{{ stat.label }}</div>
                </div>
            </div>
            <button @click="refreshData" class="btn btn-primary">
                Refresh Data
            </button>
        </div>
    `,
    
    data() {
        return {
            stats: []
        };
    },
    
    mounted() {
        this.loadStats();
    },
    
    methods: {
        async loadStats() {
            // Load statistics from API
            const deals = await this.loadDeals();
            
            this.stats = [
                { id: 1, label: 'Total Deals', value: deals.length },
                { id: 2, label: 'Active Users', value: 0 },
                { id: 3, label: 'Tasks', value: 0 }
            ];
        },
        
        async loadDeals() {
            const response = await ApiService.callBitrixMethod('crm.deal.list', {
                select: ['ID', 'TITLE', 'OPPORTUNITY'],
                filter: { '>OPPORTUNITY': 0 }
            });
            
            return response.data?.result || [];
        },
        
        refreshData() {
            BX24.fitWindow();
            this.loadStats();
        }
    }
};

// Settings Component
const SettingsComponent = {
    template: `
        <div class="settings">
            <h2>Settings</h2>
            <form @submit.prevent="saveSettings">
                <div class="form-group">
                    <label>Application Name</label>
                    <input v-model="formData.appName" type="text" class="form-control">
                </div>
                
                <div class="form-group">
                    <label>Enable Notifications</label>
                    <input v-model="formData.notifications" type="checkbox">
                </div>
                
                <div class="form-group">
                    <label>Webhook URL</label>
                    <input v-model="formData.webhookUrl" type="text" class="form-control" readonly>
                </div>
                
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
        </div>
    `,
    
    data() {
        return {
            formData: {
                appName: '',
                notifications: false,
                webhookUrl: window.location.origin + '/api/webhook.php'
            }
        };
    },
    
    methods: {
        async saveSettings() {
            await this.$parent.saveSetting('app_settings', JSON.stringify(this.formData));
        }
    }
};

// Reports Component
const ReportsComponent = {
    template: `
        <div class="reports">
            <h2>Reports</h2>
            <p>Reports content here...</p>
        </div>
    `
};

// Create Vue app
const app = createApp({
    components: {
        'app-component': AppComponent,
        'dashboard-component': DashboardComponent,
        'settings-component': SettingsComponent,
        'reports-component': ReportsComponent
    }
});

app.mount('#app');
```

## React Integration

### React Setup

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <script>window.APP_DATA = <?php echo json_encode($appData); ?>;</script>
    <script src="//api.bitrix24.com/api/v1/"></script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="js/app.jsx"></script>
</body>
</html>
```

```jsx
// js/app.jsx
const { useState, useEffect, useCallback } = React;

// API Hook
function useApi() {
    const baseURL = '/api/rest.php';
    
    const request = useCallback(async (endpoint, options = {}) => {
        const response = await fetch(baseURL + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + window.APP_DATA.app_sid,
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }, []);
    
    return {
        getPortalSettings: () => request('/portal/settings?domain=' + window.APP_DATA.domain),
        saveSettings: (key, value) => request('/portal/settings', {
            method: 'POST',
            body: JSON.stringify({
                domain: window.APP_DATA.domain,
                key,
                value
            })
        }),
        callBitrixMethod: (method, params) => request('/bitrix/call', {
            method: 'POST',
            body: JSON.stringify({
                domain: window.APP_DATA.domain,
                method,
                params
            })
        })
    };
}

// Main App Component
function App() {
    const [currentUser, setCurrentUser] = useState({});
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const api = useApi();
    
    useEffect(() => {
        // Initialize BX24
        BX24.init(() => {
            console.log('BX24 initialized');
            BX24.fitWindow();
            
            // Get current user
            BX24.callMethod('user.current', {}, (result) => {
                if (!result.error()) {
                    setCurrentUser(result.data());
                }
            });
        });
        
        // Load settings
        loadSettings();
    }, []);
    
    const loadSettings = async () => {
        setLoading(true);
        try {
            const response = await api.getPortalSettings();
            if (response.success) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const saveSetting = async (key, value) => {
        try {
            const response = await api.saveSettings(key, value);
            if (response.success) {
                console.log('Settings saved');
                await loadSettings();
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };
    
    const renderTab = () => {
        switch(activeTab) {
            case 'dashboard':
                return <Dashboard api={api} />;
            case 'settings':
                return <Settings settings={settings} onSave={saveSetting} />;
            case 'reports':
                return <Reports api={api} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="app">
            <Header user={currentUser} />
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="content">
                {loading ? <Loader /> : renderTab()}
            </div>
        </div>
    );
}

// Header Component
function Header({ user }) {
    const appData = window.APP_DATA;
    
    return (
        <div className="header">
            <h1>Bitrix24 App</h1>
            <div className="user-info">
                {user.NAME} {user.LAST_NAME}
                {user.ADMIN && <span className="badge">Admin</span>}
            </div>
            <LicenseStatus 
                isTrial={appData.is_trial}
                hasLicense={appData.has_license}
                daysRemaining={appData.license_status?.days_remaining}
            />
        </div>
    );
}

// License Status Component
function LicenseStatus({ isTrial, hasLicense, daysRemaining }) {
    if (hasLicense) {
        return <div className="license-status licensed">Licensed</div>;
    }
    
    if (isTrial) {
        const className = daysRemaining <= 3 ? 'trial-expiring' : 'trial';
        return (
            <div className={`license-status ${className}`}>
                Trial: {daysRemaining} days remaining
            </div>
        );
    }
    
    return <div className="license-status expired">License required</div>;
}

// Navigation Component
function Navigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'settings', label: 'Settings' },
        { id: 'reports', label: 'Reports' }
    ];
    
    return (
        <div className="nav-tabs">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

// Dashboard Component
function Dashboard({ api }) {
    const [stats, setStats] = useState([]);
    const [deals, setDeals] = useState([]);
    
    useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            const response = await api.callBitrixMethod('crm.deal.list', {
                select: ['ID', 'TITLE', 'OPPORTUNITY'],
                filter: { '>OPPORTUNITY': 0 }
            });
            
            if (response.success) {
                const dealData = response.data.result || [];
                setDeals(dealData);
                
                setStats([
                    { id: 1, label: 'Total Deals', value: dealData.length },
                    { id: 2, label: 'Total Value', value: dealData.reduce((sum, d) => sum + parseFloat(d.OPPORTUNITY || 0), 0) },
                    { id: 3, label: 'Avg Deal', value: dealData.length ? Math.round(dealData.reduce((sum, d) => sum + parseFloat(d.OPPORTUNITY || 0), 0) / dealData.length) : 0 }
                ]);
            }
        } catch (error) {
            console.error('Failed to load deals:', error);
        }
    };
    
    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <div className="stats-grid">
                {stats.map(stat => (
                    <div key={stat.id} className="stat-card">
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>
            
            <h3>Recent Deals</h3>
            <div className="deals-list">
                {deals.slice(0, 5).map(deal => (
                    <div key={deal.ID} className="deal-item">
                        <span>{deal.TITLE}</span>
                        <span>${deal.OPPORTUNITY}</span>
                    </div>
                ))}
            </div>
            
            <button onClick={loadData} className="btn btn-primary">
                Refresh Data
            </button>
        </div>
    );
}

// Settings Component
function Settings({ settings, onSave }) {
    const [formData, setFormData] = useState({
        appName: settings.appName || '',
        notifications: settings.notifications || false,
        webhookUrl: window.location.origin + '/api/webhook.php'
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave('app_settings', JSON.stringify(formData));
    };
    
    return (
        <div className="settings">
            <h2>Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Application Name</label>
                    <input 
                        type="text" 
                        value={formData.appName}
                        onChange={(e) => setFormData({...formData, appName: e.target.value})}
                        className="form-control"
                    />
                </div>
                
                <div className="form-group">
                    <label>
                        <input 
                            type="checkbox"
                            checked={formData.notifications}
                            onChange={(e) => setFormData({...formData, notifications: e.target.checked})}
                        />
                        Enable Notifications
                    </label>
                </div>
                
                <button type="submit" className="btn btn-primary">Save Settings</button>
            </form>
        </div>
    );
}

// Reports Component
function Reports({ api }) {
    return (
        <div className="reports">
            <h2>Reports</h2>
            <p>Reports functionality coming soon...</p>
        </div>
    );
}

// Loader Component
function Loader() {
    return <div className="loader">Loading...</div>;
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

## API Communication

### Fetch API Wrapper

```javascript
class BitrixAPI {
    constructor() {
        this.baseURL = '/api/rest.php';
        this.token = window.APP_DATA.app_sid;
        this.domain = window.APP_DATA.domain;
    }
    
    async request(endpoint, options = {}) {
        const url = this.baseURL + endpoint;
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                'X-Bitrix-Domain': this.domain,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new ApiError(data.message || 'API Error', response.status, data);
            }
            
            return data;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError('Network error', 0, error);
        }
    }
    
    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(endpoint + (queryString ? '?' + queryString : ''));
    }
    
    // POST request
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    // PUT request
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // Bitrix24 API proxy
    async callMethod(method, params = {}) {
        return this.post('/bitrix/call', {
            domain: this.domain,
            method,
            params
        });
    }
    
    // Batch API call
    async callBatch(commands, halt = false) {
        return this.post('/bitrix/batch', {
            domain: this.domain,
            commands,
            halt
        });
    }
}

// Custom error class
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

// Usage
const api = new BitrixAPI();

// Get portal settings
api.get('/portal/settings')
    .then(response => console.log('Settings:', response))
    .catch(error => console.error('Error:', error));

// Call Bitrix24 method
api.callMethod('crm.deal.list', {
    select: ['ID', 'TITLE'],
    filter: { '>OPPORTUNITY': 1000 }
})
.then(response => console.log('Deals:', response))
.catch(error => console.error('Error:', error));
```

## Styling

### CSS Framework Integration

```html
<!-- Bootstrap 5 -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Custom styles -->
<style>
    /* Bitrix24 compatible styles */
    body {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 13px;
        background: transparent;
    }
    
    /* Match Bitrix24 UI */
    .ui-btn-primary {
        background: #bbed21;
        color: #535c69;
        border: 1px solid #a7e605;
        padding: 7px 18px;
        border-radius: 2px;
        cursor: pointer;
    }
    
    .ui-btn-primary:hover {
        background: #b3e520;
    }
</style>
```

## Build Tools Integration

### Webpack Configuration

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
};
```

### Package.json

```json
{
    "name": "bitrix24-app-frontend",
    "version": "1.0.0",
    "scripts": {
        "dev": "webpack --mode development --watch",
        "build": "webpack --mode production",
        "serve": "webpack serve --mode development"
    },
    "dependencies": {
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "vue": "^3.0.0",
        "axios": "^1.0.0"
    },
    "devDependencies": {
        "@babel/core": "^7.0.0",
        "@babel/preset-env": "^7.0.0",
        "@babel/preset-react": "^7.0.0",
        "babel-loader": "^8.0.0",
        "css-loader": "^6.0.0",
        "style-loader": "^3.0.0",
        "webpack": "^5.0.0",
        "webpack-cli": "^4.0.0",
        "webpack-dev-server": "^4.0.0"
    }
}
```

## TypeScript Support

### TypeScript Definitions

```typescript
// types/bitrix24.d.ts
declare global {
    interface Window {
        BX24: BX24Interface;
        APP_DATA: AppData;
    }
    
    interface AppData {
        domain: string;
        protocol: boolean;
        lang: string;
        app_sid: string;
        auth_id: string;
        member_id: string;
        user_id: string;
        placement?: string;
        is_admin?: boolean;
        settings?: Record<string, any>;
        api_endpoint: string;
        license_status: LicenseStatus;
        is_trial: boolean;
        has_license: boolean;
    }
    
    interface LicenseStatus {
        status: 'trial' | 'licensed' | 'expired' | 'blocked';
        is_valid: boolean;
        days_remaining?: number;
        expires_at?: string;
    }
    
    interface BX24Interface {
        init(callback: () => void): void;
        fitWindow(): void;
        callMethod(method: string, params: any, callback: (result: BX24Result) => void): void;
        callBatch(calls: Record<string, any>, callback: (result: any) => void, bHaltOnError?: boolean): void;
        getAuth(): BX24Auth;
        placement: {
            info(): PlacementInfo;
            call(command: string, params: any, callback: (result: any) => void): void;
        };
    }
    
    interface BX24Result {
        data(): any;
        error(): any;
        more(): boolean;
        total(): number;
        next(): void;
    }
    
    interface BX24Auth {
        access_token: string;
        domain: string;
        expires_in: number;
        member_id: string;
        refresh_token: string;
        scope: string;
    }
    
    interface PlacementInfo {
        placement: string;
        options: Record<string, any>;
    }
}

export {};
```

## Best Practices

### 1. Error Handling

```javascript
class ErrorBoundary {
    constructor(container) {
        this.container = container;
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    }
    
    handleError(event) {
        console.error('Global error:', event.error);
        this.showError('An unexpected error occurred');
    }
    
    handleRejection(event) {
        console.error('Unhandled rejection:', event.reason);
        this.showError('Operation failed');
    }
    
    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.textContent = message;
        this.container.prepend(alert);
        
        setTimeout(() => alert.remove(), 5000);
    }
}
```

### 2. Loading States

```javascript
class LoadingManager {
    show() {
        BX24.showLoading();
    }
    
    hide() {
        BX24.hideLoading();
    }
    
    async withLoading(promise) {
        this.show();
        try {
            return await promise;
        } finally {
            this.hide();
        }
    }
}

// Usage
const loading = new LoadingManager();
await loading.withLoading(api.callMethod('crm.deal.list'));
```

### 3. Caching

```javascript
class CacheManager {
    constructor(ttl = 300000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    set(key, value) {
        this.cache.set(key, {
            value,
            expires: Date.now() + this.ttl
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    async fetch(key, fetcher) {
        let data = this.get(key);
        
        if (data === null) {
            data = await fetcher();
            this.set(key, data);
        }
        
        return data;
    }
}

// Usage
const cache = new CacheManager();
const deals = await cache.fetch('deals', () => 
    api.callMethod('crm.deal.list')
);
```

### 4. Responsive Design

```css
/* Mobile responsive */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .nav-tabs {
        flex-direction: column;
    }
}

/* Bitrix24 mobile app */
@media (max-width: 480px) {
    body {
        font-size: 14px;
    }
    
    .header h1 {
        font-size: 18px;
    }
}
```

## Performance Optimization

### 1. Lazy Loading

```javascript
// Lazy load components
const LazyReports = () => import('./components/Reports');

// In router or component
if (route === 'reports') {
    const ReportsModule = await LazyReports();
    const Reports = ReportsModule.default;
    renderComponent(Reports);
}
```

### 2. Debouncing

```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Usage
const searchDeals = debounce(async (query) => {
    const results = await api.callMethod('crm.deal.list', {
        filter: { '%TITLE': query }
    });
    displayResults(results);
}, 300);
```

### 3. Virtual Scrolling

```javascript
class VirtualList {
    constructor(container, items, itemHeight = 50) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleItems = Math.ceil(container.clientHeight / itemHeight);
        this.render();
    }
    
    render() {
        const scrollTop = this.container.scrollTop;
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = startIndex + this.visibleItems;
        
        const visibleItems = this.items.slice(startIndex, endIndex);
        
        this.container.innerHTML = '';
        const spacer = document.createElement('div');
        spacer.style.height = `${startIndex * this.itemHeight}px`;
        this.container.appendChild(spacer);
        
        visibleItems.forEach(item => {
            const element = this.createItemElement(item);
            this.container.appendChild(element);
        });
    }
    
    createItemElement(item) {
        const div = document.createElement('div');
        div.style.height = `${this.itemHeight}px`;
        div.textContent = item.title;
        return div;
    }
}
```