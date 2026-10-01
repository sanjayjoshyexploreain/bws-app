<?php
$flowRes = PowerAutomate::callFlow($config['FLOW_GENERATE_OTP'], new stdClass());
echo json_encode($flowRes);
