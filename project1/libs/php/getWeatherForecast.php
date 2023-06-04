

<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$countryCode = $_POST['countryCode'];
$username = "bavram"; 

// Fetch country info from Geonames API
$url = "http://api.geonames.org/countryInfoJSON";
$queryParams = [
    'formatted' => true,
    'country' => $countryCode,
    'username' => $username
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($queryParams));

$result = curl_exec($ch);
$decode = json_decode($result, true);

$capital = $decode['geonames'][0]['capital'];

// Use the fetched capital to get weather data from Weather API
$apiKey = '8c5822c88193417c849203621230206'; 
$weatherUrl = "http://api.weatherapi.com/v1/forecast.json";
$weatherQueryParams = [
    'key' => $apiKey,
    'q' => $capital,
    'days' => 3
];

curl_setopt($ch, CURLOPT_URL, $weatherUrl . '?' . http_build_query($weatherQueryParams));
$result = curl_exec($ch);
$decode = json_decode($result, true);

// Extract forecast data for the next 3 days
$forecast = [];
for ($i = 0; $i < 3; $i++) {
    $dayForecast = $decode['forecast']['forecastday'][$i];
    $forecast[] = [
        'date' => $dayForecast['date'],
        'minC' => $dayForecast['day']['mintemp_c'],
        'maxC' => $dayForecast['day']['maxtemp_c'],
        'conditionIcon' => $dayForecast['day']['condition']['icon'],
        'conditionText' => $dayForecast['day']['condition']['text']
    ];
}

curl_close($ch);

// Prepare the data to be sent back
$data = [
    'location' => $decode['location']['name'],
    'country' => $decode['location']['country'],
    'forecast' => $forecast,
    'lastUpdated' => $decode['current']['last_updated']
];

// Send the result back to the AJAX call
header('Content-Type: application/json; charset=UTF-8');
echo json_encode(['status' => ['code' => 200], 'data' => $data]);
?>
