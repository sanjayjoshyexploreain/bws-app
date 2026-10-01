<?php
$flowRes = PowerAutomate::callFlow($config['FLOW_MONTHLY_REPORT'], $body);
echo json_encode($flowRes);
