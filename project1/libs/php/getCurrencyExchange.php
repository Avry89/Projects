<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$countryCode = $_GET['countryCode'];
$username = "bavram"; 

// fetch country info from Geonames API
$url="http://api.geonames.org/countryInfoJSON?formatted=true&country={$countryCode}&username={$username}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['geonames'];
// Get the currency code from Geonames api and use it ot make a call to the currency exchange api
$currencyCode = $output['data'][0]['currencyCode'];


error_reporting(E_ALL);
ini_set('display_errors', '1');

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "https://currency-converter5.p.rapidapi.com/currency/convert?format=json&from=GBP&to=" . $currencyCode . "&amount=1",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => [
        "X-RapidAPI-Host: currency-converter5.p.rapidapi.com",
		"X-RapidAPI-Key: ecbcf91069msh597803f9a648eb3p1d9650jsn6caf712574f5"
    ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'cURL Error #:' . $err]);
} else {
    $result = json_decode($response, true);
    $formatted_result = ['data' => $result];

    header('Content-Type: application/json');
    echo json_encode($formatted_result);
}
