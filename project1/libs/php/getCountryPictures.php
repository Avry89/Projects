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

    // Now use the country name to make a request to the Unsplash API

    $accessKey = 'Uvo_mLXdG1iM4qD9ckSlSS9qZdKtnV8dWCDbWI8BvX0'; 
    $url = "https://api.unsplash.com/search/photos?query=$countryName&client_id=$accessKey";

    curl_setopt($ch, CURLOPT_URL, $url);
    $resultUnsplash = curl_exec($ch);

    $decodeUnsplash = json_decode($resultUnsplash, true);
} else {
    $decodeUnsplash = null;
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
        'unsplash' => $decodeUnsplash ? $decodeUnsplash['results'] : null // Add Unsplash results to output if available
    ]
];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
?>
