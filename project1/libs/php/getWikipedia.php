
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

// Wikipedia API

$countryName = $geonamesData[0]['countryName'];
$wikipediaUrl = "http://api.geonames.org/wikipediaSearchJSON";
$wikiParams = [
    'formatted' => true,
    'q' => $countryName,
    'maxRows' => 10,
    'username' => 'bavram'
];

curl_setopt($ch, CURLOPT_URL, $wikipediaUrl . '?' . http_build_query($wikiParams));

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: application/json"
]);

$wikipediaResult = curl_exec($ch);
$wikipediaDecode = json_decode($wikipediaResult, true);

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
        'wikipedia' => $wikipediaDecode
    ]
];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);
?>
