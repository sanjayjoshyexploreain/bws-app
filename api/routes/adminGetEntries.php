<?php
$flowRes = PowerAutomate::callFlow($config['FLOW_ADMIN_GET_ENTRIES'], $body);
echo json_encode($flowRes);
