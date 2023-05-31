<?php



    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $north = $_REQUEST['north'];
    $east = $_REQUEST['east'];
    $south = $_REQUEST['south'];
    $west = $_REQUEST['west'];

    $url = "http://api.geonames.org/earthquakesJSON";
    $queryParams = [
        'formatted' => true,
        'north' => $north,
        'south' => $south,
        'east' => $east,
        'west' => $west,
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
        'data' => $decode['earthquakes']
    ];

    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
?>

