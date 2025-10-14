// install/js/install.js
/**
 * Головний файл установки
 * Координує процес установки додатку в Bitrix24
 */

(function() {
    'use strict';
    
    // Отримуємо параметри установки з PHP
    const params = window.INSTALL_PARAMS || {};
    
    // Кроки установки
    const installSteps = {
        steps: [
            { id: 'step1', name: 'Підключення до Bitrix24', status: 'pending' },
            { id: 'step2', name: 'Налаштування вебхуків', status: 'pending' },
            { id: 'step3', name: 'Реєстрація розміщень', status: 'pending' },
            { id: 'step4', name: 'Створення сховищ', status: 'pending' },
            { id: 'step5', name: 'Завершення установки', status: 'pending' }
        ],
        current: 0,
        total: 5
    };
    
    /**
     * Оновлює прогрес UI
     */
    function updateProgress(stepIndex, status) {
        const step = installSteps.steps[stepIndex];
        if (!step) return;
        
        const element = document.getElementById(step.id);
        if (!element) return;
        
        // Оновлюємо статус кроку
        if (status === 'active') {
            element.classList.add('active');
            element.classList.remove('completed', 'error');
            step.status = 'active';
        } else if (status === 'completed') {
            element.classList.remove('active', 'error');
            element.classList.add('completed');
            element.querySelector('.step-icon').innerHTML = '✓';
            step.status = 'completed';
        } else if (status === 'error') {
            element.classList.remove('active', 'completed');
            element.classList.add('error');
            step.status = 'error';
        }
        
        // Оновлюємо прогрес-бар
        const completedSteps = installSteps.steps.filter(s => s.status === 'completed').length;
        const progress = (completedSteps / installSteps.total) * 100;
        document.getElementById('progress').style.width = progress + '%';
    }
    
    /**
     * Оновлює текст статусу
     */
    function updateStatus(message) {
        const statusElement = document.querySelector('.status');
        if (statusElement) {
            statusElement.textContent = message;
        }
        console.log('Статус:', message);
    }
    
    /**
     * Показує помилку
     */
    function showError(message) {
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.textContent = 'Помилка: ' + message;
            errorDiv.style.display = 'block';
        }
        
        const spinner = document.getElementById('spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
        
        const successDiv = document.getElementById('success');
        if (successDiv) {
            successDiv.style.display = 'none';
        }
        
        console.error('Помилка установки:', message);
    }
    
    /**
     * Показує успішне завершення
     */
    function showSuccess() {
        const successDiv = document.getElementById('success');
        if (successDiv) {
            successDiv.style.display = 'block';
        }
        
        const spinner = document.getElementById('spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
        
        const errorDiv = document.getElementById('error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
        
        updateStatus('Установка завершена успішно!');
    }
    
    /**
     * Крок 1: Ініціалізація BX24
     */
    function step1_InitializeBX24() {
        console.log('=== КРОК 1: Ініціалізація BX24 ===');
        updateProgress(0, 'active');
        updateStatus('Підключення до Bitrix24...');
        
        BX24.init(function() {
            console.log('BX24 ініціалізовано');
            console.log('Domain:', BX24.getDomain());
            console.log('Auth:', BX24.getAuth());
            
            updateProgress(0, 'completed');
            
            // Переходимо до наступного кроку
            step2_SetupWebhooks();
        });
    }
    
    /**
     * Крок 2: Налаштування вебхуків
     */
    function step2_SetupWebhooks() {
        console.log('=== КРОК 2: Налаштування вебхуків ===');
        updateProgress(1, 'active');
        updateStatus('Налаштування вебхуків...');
        
        // Використовуємо WebhooksManager з webhooks.js
        WebhooksManager.setupWebhooks(
            params,
            // Progress callback
            function(message) {
                updateStatus(message);
            },
            // Complete callback
            function(success, error) {
                if (!success) {
                    updateProgress(1, 'error');
                    showError('Помилка налаштування вебхуків: ' + (error || 'Невідома помилка'));
                    return;
                }
                
                updateProgress(1, 'completed');
                
                // Переходимо до наступного кроку
                step3_SetupPlacements();
            }
        );
    }
    
    /**
     * Крок 3: Налаштування розміщень
     */
    function step3_SetupPlacements() {
        console.log('=== КРОК 3: Налаштування розміщень ===');
        updateProgress(2, 'active');
        updateStatus('Реєстрація розміщень...');
        
        // Використовуємо PlacementsManager з placements.js
        PlacementsManager.setupPlacements(
            // Progress callback
            function(message) {
                updateStatus(message);
            },
            // Complete callback
            function(success, error) {
                if (!success) {
                    updateProgress(2, 'error');
                    showError('Помилка налаштування розміщень: ' + (error || 'Невідома помилка'));
                    return;
                }
                
                updateProgress(2, 'completed');
                
                // Переходимо до наступного кроку
                step4_SetupStorages();
            }
        );
    }
    
    /**
     * Крок 4: Налаштування сховищ
     */
    function step4_SetupStorages() {
        console.log('=== КРОК 4: Налаштування сховищ ===');
        updateProgress(3, 'active');
        updateStatus('Створення сховищ даних...');
        
        // Використовуємо StorageManager з storage.js
        StorageManager.setupStorages(
            // Progress callback
            function(message) {
                updateStatus(message);
            },
            // Complete callback
            function(success, error) {
                if (!success) {
                    updateProgress(3, 'error');
                    showError('Помилка створення сховищ: ' + (error || 'Невідома помилка'));
                    return;
                }
                
                updateProgress(3, 'completed');
                
                // Переходимо до завершення
                step5_Finish();
            }
        );
    }
    
    /**
     * Крок 5: Завершення установки
     */
    function step5_Finish() {
        console.log('=== КРОК 5: Завершення установки ===');
        updateProgress(4, 'active');
        updateStatus('Завершення установки...');
        
        // Показуємо успіх
        setTimeout(function() {
            updateProgress(4, 'completed');
            showSuccess();
            
            // Завершуємо установку в Bitrix24
            setTimeout(function() {
                console.log('Виклик BX24.installFinish()');
                BX24.installFinish();
            }, 1500);
        }, 500);
    }
    
    /**
     * Запуск процесу установки
     */
    function startInstallation() {
        console.log('====================================');
        console.log('ПОЧАТОК УСТАНОВКИ ДОДАТКУ');
        console.log('====================================');
        console.log('Параметри установки:', params);
        
        // Валідація параметрів
        if (!params.DOMAIN || !params.APP_SID) {
            showError('Відсутні необхідні параметри установки');
            return;
        }
        
        // Починаємо з першого кроку
        step1_InitializeBX24();
    }
    
    /**
     * Обробка помилок
     */
    window.addEventListener('error', function(event) {
        console.error('Глобальна помилка:', event.error);
        showError('Критична помилка: ' + (event.error ? event.error.message : 'Невідома помилка'));
    });
    
    // Запускаємо установку після завантаження DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInstallation);
    } else {
        startInstallation();
    }
    
})();