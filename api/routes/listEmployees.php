<?php
$flowRes = PowerAutomate::callFlow($config['FLOW_LIST_EMPLOYEES'], empty($body) ? new stdClass() : $body);
echo json_encode($flowRes);
