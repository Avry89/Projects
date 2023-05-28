<?php
/*
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $lat = $_REQUEST['latOne'];
    $lng = $_REQUEST['lngOne'];

    $url="http://api.geonames.org/countryCodeJSON?formatted=true&lat={$lat}&lng={$lng}&username=bavram";

    $ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

    $decode = json_decode($result,true);    

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode;

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); */
    
    

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $lat = $_REQUEST['latOne'];
    $lng = $_REQUEST['lngOne'];

    $url = "http://api.geonames.org/countryCodeJSON";
    $queryParams = [
        'formatted' => true,
        'lat' => $lat,
        'lng' => $lng,
        'username' => 'bavram'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($queryParams));

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);    

    $output = [
        'status' => [
            'code' => '200',
            'name' => 'ok',
            'description' => 'success',
            'returnedIn' => intval((microtime(true) - $executionStartTime) * 1000) . ' ms'
        ],
        'data' => $decode
    ];

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);
