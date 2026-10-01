<?php
require_once __DIR__ . '/vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class Auth {
    private $secret;

    public function __construct($secret) {
        $this->secret = $secret;
    }

    public function generateToken($employeeId, $employeeSpId, $role) {
        $payload = [
            'iat' => time(),
            'exp' => time() + (12 * 60 * 60), // 12 hours expiration
            'employeeId' => $employeeId,
            'employeeSpId' => $employeeSpId,
            'role' => $role
        ];
        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function authenticateToken() {
        $headers = array_change_key_case(getallheaders(), CASE_LOWER);
        $authHeader = isset($headers['authorization']) ? $headers['authorization'] : '';
        
        if (empty($authHeader)) {
            $this->sendError(401, 'Access Denied: No Token Provided');
        }

        $parts = explode(' ', $authHeader);
        if (count($parts) !== 2 || strcasecmp($parts[0], 'Bearer') !== 0) {
            $this->sendError(401, 'Access Denied: Invalid Token Format');
        }

        $token = $parts[1];

        try {
            // This validates signature, algorithm (HS256), and expiration (exp) automatically
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            error_log("JWT Decode Error: " . $e->getMessage() . " Secret length: " . strlen($this->secret));
            $this->sendError(403, 'Invalid Token');
        }
    }

    public function requireAdmin($user) {
        if (!isset($user['role']) || $user['role'] !== 'Admin') {
            $this->sendError(403, 'Access Denied: Admin role required');
        }
    }

    private function sendError($code, $message) {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }
}
