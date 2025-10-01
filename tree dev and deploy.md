
```
/bitrix24-app-template/
├── /frontend/              # Vue 3 + Ant Design
│   ├── /src/
│   │   ├── /api/          # API клієнт
│   │   ├── /components/   # Компоненти
│   │   ├── /composables/  # Composition API логіка
│   │   ├── /views/        # Сторінки
│   │   ├── /stores/       # Pinia stores
│   │   ├── /router/       # Vue Router
│   │   ├── /assets/       # Статика
│   │   └── App.vue
│   ├── /dist/             # Build результат
│   └── package.json
│
├── /backend/              # PHP Backend
│   ├── /api/             # API endpoints
│   ├── /config/          # Конфігурація
│   ├── /handlers/        # Event handlers
│   ├── /lib/             # Core класи
│   └── bootstrap.php
│
├── /public/              # DocumentRoot
│   ├── index.php         # Entry point
│   ├── /api/            # API endpoints
│   └── /install/        # Інсталятор
│
└── /deploy/             # Deployment конфіги
    ├── nginx.conf
    └── deploy.sh
```

## При деплої на сервер:

```
/production-server/
└── /versions/
    ├── /v1/
    │   ├── /public/     # Frontend build + PHP entry
    │   └── /backend/    # Backend код
    └── /v2/
        ├── /public/
        └── /backend/
```

## Workflow:

1. **Локально** - розробляєте як single version
2. **Build** - Vue збирається в `/frontend/dist/`  
3. **Deploy** - копіюєте в `/versions/vX/` на сервері
4. **Public** - містить PHP entry + Vue build

