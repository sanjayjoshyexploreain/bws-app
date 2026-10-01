<?php
// Front controller for BWS Middleware API
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = require __DIR__ . '/config.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/PowerAutomate.php';

$auth = new Auth($config['JWT_SECRET']);

// Determine the requested route, ignoring any base path
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/api';
if (strpos($requestUri, $basePath) === 0) {
    $route = substr($requestUri, strlen($basePath));
} else {
    $route = $requestUri; // Handle cases where it's mapped directly
}
if (empty($route)) {
    $route = '/';
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    $body = [];
}

try {
    switch ($route) {
        case '/health':
            echo json_encode(['status' => 'ok']);
            break;
            
        case '/login':
            require __DIR__ . '/routes/login.php';
            break;

        case '/generateOtp':
            require __DIR__ . '/routes/generateOtp.php';
            break;

        case '/submitEntry':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/submitEntry.php';
            break;

        case '/getMyEntries':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/getMyEntries.php';
            break;

        case '/uploadPhoto':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/uploadPhoto.php';
            break;

        case '/submitWorkwearRequest':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/submitWorkwearRequest.php';
            break;

        case '/updatePIN':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/updatePIN.php';
            break;

        case '/getPhotos':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/getPhotos.php';
            break;

        case '/listEmployees':
            $user = $auth->authenticateToken();
            require __DIR__ . '/routes/listEmployees.php';
            break;

        case '/adminGetEntries':
            $user = $auth->authenticateToken();
            $auth->requireAdmin($user);
            require __DIR__ . '/routes/adminGetEntries.php';
            break;

        case '/reviewEntry':
            $user = $auth->authenticateToken();
            $auth->requireAdmin($user);
            require __DIR__ . '/routes/reviewEntry.php';
            break;

        case '/monthlyReport':
            $user = $auth->authenticateToken();
            $auth->requireAdmin($user);
            require __DIR__ . '/routes/monthlyReport.php';
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Route not found']);
            break;
    }
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
