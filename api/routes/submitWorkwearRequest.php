<?php
$payload = array_merge($body, [
    'employeeId' => $user['employeeId'] ?? null
]);
$flowRes = PowerAutomate::callFlow($config['FLOW_SUBMIT_WORKWEAR_REQUEST'], $payload);
echo json_encode($flowRes);
