<?php
$payload = array_merge($body, [
    'employeeSpId' => $user['employeeSpId'] ?? null
]);
$flowRes = PowerAutomate::callFlow($config['FLOW_UPDATE_PIN'], $payload);
echo json_encode($flowRes);
