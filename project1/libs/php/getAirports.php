
<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

// set the return header
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

$executionStartTime = microtime(true);

$countryCode = $_POST['countryCode'];

$url = 'http://api.geonames.org/searchJSON?q=airport&country=' . $countryCode . '&maxRows=30&lang=en&username=bavram';

$ch = curl_init();

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

$cURLERROR = curl_errno($ch);

curl_close($ch);

if ($cURLERROR) {

    $output['status']['code'] = $cURLERROR;
    $output['status']['name'] = "Failure - cURL";
    $output['status']['description'] = curl_strerror($cURLERROR);
    $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
    $output['data'] = null;
} else {

    $airports = json_decode($result, true);

    if (json_last_error() !== JSON_ERROR_NONE) {

        $output['status']['code'] = json_last_error();
        $output['status']['name'] = "Failure - JSON";
        $output['status']['description'] = json_last_error_msg();
        $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
        $output['data'] = null;
    } else {

        if (isset($airports['status'])) {

            $output['status']['code'] = $airports['status']['value'];
            $output['status']['name'] = "Failure - API";
            $output['status']['description'] = $airports['status']['message'];
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = null;
        } else {

            $finalResult = [];

            foreach ($airports['geonames'] as $item) {

                $temp['name'] = $item['name'];
                $temp['lat'] = $item['lat'];
                $temp['lng'] = $item['lng'];

                array_push($finalResult, $temp);
            }

            $output['status']['code'] = 200;
            $output['status']['name'] = "success";
            $output['status']['description'] = "all ok";
            $output['status']['seconds'] = number_format((microtime(true) - $executionStartTime), 3);
            $output['data'] = $finalResult;
        }
    }
}

echo json_encode($output, JSON_NUMERIC_CHECK);

?>
