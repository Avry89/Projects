<?php


// Setting error reporting for development
ini_set('display_errors', 'On');
error_reporting(E_ALL);

// Record the time at which execution starts
$executionStartTime = microtime(true);

// Get the country code from the GET request
$countryCode = $_POST['countryCode'];

// Define the API endpoint
$url = 'http://api.geonames.org/searchJSON';

// Define the query parameters for the API request
$queryParams = [
    'country' => $countryCode,
    'cities' => 'cities15000',
    'maxRows' => 30,
    'lang' => 'en',
    'username' => 'bavram',
    'style' => 'full'
];

// Initialize cURL session
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // To not verify the peer's SSL certificate
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // To return the transfer as a string
curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($queryParams)); // Setting URL and query parameters

// Execute the cURL session
$result = curl_exec($ch);

// Get any error number if present
$cURLERROR = curl_errno($ch);

// Close the cURL session
curl_close($ch);

$output = [];

// Check for cURL errors
if ($cURLERROR) {
    $output['status'] = [
        'code' => $cURLERROR,
        'name' => 'Failure - cURL',
        'description' => curl_strerror($cURLERROR),
        'returnedIn' => number_format((microtime(true) - $executionStartTime), 3),
    ];
    $output['data'] = null;
} else {
    // Decode the cURL result to an associative array
    $cities = json_decode($result, true);

    // Check for JSON errors
    if (json_last_error() !== JSON_ERROR_NONE) {
        $output['status'] = [
            'code' => json_last_error(),
            'name' => 'Failure - JSON',
            'description' => json_last_error_msg(),
            'returnedIn' => number_format((microtime(true) - $executionStartTime), 3),
        ];
        $output['data'] = null;
    } else {
        // Check for API errors
        if (isset($cities['status'])) {
            $output['status'] = [
                'code' => $cities['status']['value'],
                'name' => 'Failure - API',
                'description' => $cities['status']['message'],
                'returnedIn' => number_format((microtime(true) - $executionStartTime), 3),
            ];
            $output['data'] = null;
        } else {
            // Create an array for final result
            $finalResult = [];
            // Process each city data
            foreach ($cities['geonames'] as $item) {
                $finalResult[] = [
                    'name' => $item['asciiName'],
                    'lat' => $item['lat'],
                    'lng' => $item['lng'],
                    'population' => $item['population'],
                ];
            }
            // Set success status
            $output['status'] = [
                'code' => 200,
                'name' => 'ok',
                'description' => 'success',
                'returnedIn' => number_format((microtime(true) - $executionStartTime), 3),
            ];
            // Set final result data
            $output['data'] = $finalResult;
        }
    }
}

// Set the header to specify that the content type is JSON
header('Content-Type: application/json; charset=UTF-8');

// Output the final array as a JSON string
echo json_encode($output, JSON_NUMERIC_CHECK);
