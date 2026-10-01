<?php
$payload = array_merge($body, [
    'employeeId' => $user['employeeId'] ?? null
]);
$flowRes = PowerAutomate::callFlow($config['FLOW_UPLOAD_PHOTO'], $payload);
echo json_encode($flowRes);
