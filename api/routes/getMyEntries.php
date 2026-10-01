<?php
$payload = array_merge($body, [
    'employeeId' => $user['employeeId'] ?? null
]);
$flowRes = PowerAutomate::callFlow($config['FLOW_GET_MY_ENTRIES'], $payload);
echo json_encode($flowRes);
