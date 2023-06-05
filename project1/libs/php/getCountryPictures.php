<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryCode = $_GET['countryCode'];

$url = "http://api.geonames.org/countryInfoJSON";
$queryParams = [
    'formatted' => true,
    'country' => $countryCode,
    'username' => 'bavram'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($queryParams));

$result = curl_exec($ch);
$decode = json_decode($result, true);

$geonamesData = array_key_exists('geonames', $decode) ? $decode['geonames'] : null;

if (!empty($geonamesData)) {
    $countryName = $geonamesData[0]['countryName']; // Get country name

    // Now use the country name to make a request to the Pixabay API

    $accessKey = '37046435-05d4bbb8e5f865bf875cb1c0a'; // Replace with your Pixabay API key
    $url = "https://pixabay.com/api/?key=$accessKey&q=$countryName";

    curl_setopt($ch, CURLOPT_URL, $url);
    $resultPixabay = curl_exec($ch);

    $decodePixabay = json_decode($resultPixabay, true);
} else {
    $decodePixabay = null;
}

curl_close($ch);

$output = [
    'status' => [
        'code' => '200',
        'name' => 'ok',
        'description' => 'success',
        'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
    ],
    'data' => [
        'geonames' => $geonamesData,
        'pixabay' => $decodePixabay ? $decodePixabay['hits'] : null // Add Pixabay results to output if available
    ]
];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
?>
