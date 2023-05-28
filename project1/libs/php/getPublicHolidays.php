<?php


$countryCode = $_GET['countryCode'];

$curl = curl_init();

curl_setopt_array($curl, [
	CURLOPT_URL => "https://public-holiday.p.rapidapi.com/2023/" . $countryCode ,
	CURLOPT_RETURNTRANSFER => true,
	CURLOPT_ENCODING => "",
	CURLOPT_MAXREDIRS => 10,
	CURLOPT_TIMEOUT => 30,
	CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET",
	CURLOPT_HTTPHEADER => [
		"X-RapidAPI-Host: public-holiday.p.rapidapi.com",
		"X-RapidAPI-Key: ecbcf91069msh597803f9a648eb3p1d9650jsn6caf712574f5"
	],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
	echo "cURL Error #:" . $err;
} else {
	echo $response;
}