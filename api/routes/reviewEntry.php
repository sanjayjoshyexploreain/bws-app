<?php
$payload = array_merge($body, [
    'reviewedBy' => $user['employeeId'] ?? null
]);
$flowRes = PowerAutomate::callFlow($config['FLOW_REVIEW_ENTRY'], $payload);
echo json_encode($flowRes);
