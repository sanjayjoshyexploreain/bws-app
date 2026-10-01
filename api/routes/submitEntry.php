<?php
$payload = array_merge($body, [
    'employeeId' => $user['employeeId'] ?? null,
    'employeeSpId' => $user['employeeSpId'] ?? null
]);
$flowRes = PowerAutomate::callFlow($config['FLOW_SUBMIT_ENTRY'], $payload);
echo json_encode($flowRes);
