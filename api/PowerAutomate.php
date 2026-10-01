<?php
class PowerAutomate {
    public static function callFlow($url, $body) {
        if (empty($url)) {
            throw new Exception("Flow URL is missing in configuration.");
        }

        $ch = curl_init($url);
        $jsonBody = empty($body) ? "{}" : json_encode($body);
        
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen($jsonBody)
        ]);
        // Increase timeout for large photo uploads
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception("Network error calling Flow: " . $error);
        }
        
        curl_close($ch);

        if ($httpCode < 200 || $httpCode >= 300) {
            throw new Exception("Flow error: $httpCode - $response");
        }

        $decoded = json_decode($response, true);
        return $decoded !== null ? $decoded : $response;
    }
}
