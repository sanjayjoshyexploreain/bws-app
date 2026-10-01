<?php
$employeeId = $body['employeeId'] ?? null;
$pin = $body['pin'] ?? null;

$flowRes = PowerAutomate::callFlow($config['FLOW_LOGIN'], ['employeeId' => $employeeId, 'pin' => $pin]);

if (!isset($flowRes['success']) || !$flowRes['success']) {
    http_response_code(401);
    echo json_encode($flowRes);
    return;
}

$isManagerOrAdmin = false;
$roleStr = $flowRes['role'] ?? '';
$nameStr = $flowRes['employeeName'] ?? '';
if ($roleStr === 'Admin' || $roleStr === 'Manager' || strpos($nameStr, 'Admin') !== false || strpos($nameStr, 'Manager') !== false) {
    $isManagerOrAdmin = true;
}

$role = $isManagerOrAdmin ? 'Admin' : 'Worker';

$token = $auth->generateToken($flowRes['employeeId'] ?? '', $flowRes['spId'] ?? null, $role);

$flowRes['token'] = $token;
$flowRes['role'] = $role;

echo json_encode($flowRes);
