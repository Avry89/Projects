<?php

$countryCode = $_REQUEST['iso'];
$executionStartTime = microtime(true);

$countryData = json_decode(file_get_contents("countryBorders.geo.json"), true);

$border = null;

foreach ($countryData['features'] as $feature) {
    if ($feature['properties']['iso_a2'] == $countryCode) {
        $border = [
            'name' => $feature['properties']['name'],
            'geometry' => $feature['geometry']
        ];
        break;
    }
}

$output = [
    'status' => [
        'code' => '200',
        'name' => 'ok',
        'description' => 'success',
        'executedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
    ],
    'data' => $border
];

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
