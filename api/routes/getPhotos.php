<?php
$flowRes = PowerAutomate::callFlow($config['FLOW_GET_PHOTOS'], $body);
echo json_encode($flowRes);
