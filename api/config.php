<?php
// config.php - Safe configuration loader for Hostinger

// If a local .env file exists in the api directory, load it.
// Hostinger supports Environment variables via .htaccess or user panels,
// but fallback to .env parsing is safer for simple setups.
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Return configuration array securely. Never print these values.
return [
    'JWT_SECRET' => getenv('JWT_SECRET') ?: '',
    'FLOW_LOGIN' => getenv('FLOW_LOGIN') ?: '',
    'FLOW_GENERATE_OTP' => getenv('FLOW_GENERATE_OTP') ?: '',
    'FLOW_SUBMIT_ENTRY' => getenv('FLOW_SUBMIT_ENTRY') ?: '',
    'FLOW_GET_MY_ENTRIES' => getenv('FLOW_GET_MY_ENTRIES') ?: '',
    'FLOW_UPLOAD_PHOTO' => getenv('FLOW_UPLOAD_PHOTO') ?: '',
    'FLOW_SUBMIT_WORKWEAR_REQUEST' => getenv('FLOW_SUBMIT_WORKWEAR_REQUEST') ?: '',
    'FLOW_UPDATE_PIN' => getenv('FLOW_UPDATE_PIN') ?: '',
    'FLOW_GET_PHOTOS' => getenv('FLOW_GET_PHOTOS') ?: '',
    'FLOW_LIST_EMPLOYEES' => getenv('FLOW_LIST_EMPLOYEES') ?: '',
    'FLOW_ADMIN_GET_ENTRIES' => getenv('FLOW_ADMIN_GET_ENTRIES') ?: '',
    'FLOW_REVIEW_ENTRY' => getenv('FLOW_REVIEW_ENTRY') ?: '',
    'FLOW_MONTHLY_REPORT' => getenv('FLOW_MONTHLY_REPORT') ?: '',
];
