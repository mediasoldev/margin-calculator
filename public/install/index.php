<!-- install/index.php -->
<?php
/**
 * Точка входу для установки додатку
 * Приймає параметри від Bitrix24 та запускає процес установки
 */

// Визначаємо що потрібна база даних
define('REQUIRE_DATABASE', true);

// Завантажуємо bootstrap додатку
require_once __DIR__ . '/../backend/bootstrap.php';

// Отримуємо параметри установки від Bitrix24
$installParams = [
    'DOMAIN' => $_REQUEST['DOMAIN'] ?? '',
    'LANG' => $_REQUEST['LANG'] ?? 'uk',
    'PROTOCOL' => $_REQUEST['PROTOCOL'] ?? 'https',
    'AUTH_ID' => $_REQUEST['AUTH_ID'] ?? '',
    'AUTH_EXPIRES' => $_REQUEST['AUTH_EXPIRES'] ?? '',
    'APP_SID' => $_REQUEST['APP_SID'] ?? '',
    'REFRESH_ID' => $_REQUEST['REFRESH_ID'] ?? '',
    'MEMBER_ID' => $_REQUEST['member_id'] ?? '',
    'INSTALL_OPTIONS' => $_REQUEST['INSTALL_OPTIONS'] ?? [],
    'PLACEMENT' => $_REQUEST['PLACEMENT'] ?? 'DEFAULT',
    'PLACEMENT_OPTIONS' => $_REQUEST['PLACEMENT_OPTIONS'] ?? [],
];

// Валідація обов'язкових параметрів
$requiredParams = ['DOMAIN', 'APP_SID'];
$missingParams = [];

foreach ($requiredParams as $param) {
    if (empty($installParams[$param])) {
        $missingParams[] = $param;
    }
}

// Якщо відсутні обов'язкові параметри
if (!empty($missingParams)) {
    error_log('[INSTALL ERROR] Відсутні параметри: ' . implode(', ', $missingParams));
    error_log('[INSTALL ERROR] Request data: ' . print_r($_REQUEST, true));
    
    http_response_code(400);
    die('Помилка установки: Відсутні обов\'язкові параметри. Спробуйте ще раз або зверніться до підтримки.');
}

// Логуємо початок установки
error_log('[INSTALL] Початок установки для домену: ' . $installParams['DOMAIN']);
error_log('[INSTALL] Параметри: ' . json_encode($installParams, JSON_UNESCAPED_UNICODE));

?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($installParams['LANG']); ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Установка додатку...</title>
    
    <script>
        // Передаємо параметри установки в JavaScript
        window.INSTALL_PARAMS = <?php echo json_encode($installParams, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>;
        
        // Додаткова інформація для дебагу
        console.log('=== ПАРАМЕТРИ УСТАНОВКИ ===');
        console.log('Domain:', window.INSTALL_PARAMS.DOMAIN);
        console.log('Language:', window.INSTALL_PARAMS.LANG);
        console.log('Member ID:', window.INSTALL_PARAMS.MEMBER_ID);
    </script>
</head>
<body>
    <!-- Підключаємо HTML розмітку -->
    <?php require_once __DIR__ . '/install.html'; ?>
</body>
</html>