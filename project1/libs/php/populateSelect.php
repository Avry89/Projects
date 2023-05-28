<?php

    

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $result = file_get_contents("countryBorders.geo.json");

    function compare($a, $b) {
        if ($a["name"] == $b["name"]) return 0;
        return ($a["name"] < $b["name"]) ? -1 : 1;
    }

    $decode = json_decode($result, true);
    $countries = [];

    foreach ($decode['features'] as $feature) {
        $countries[] = $feature['properties'];
    }

    usort($countries, "compare");

    $output = [
        'status' => [
            'code' => '200',
            'name' => 'ok',
            'description' => 'success',
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ],
        'data' => $countries
    ];

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
