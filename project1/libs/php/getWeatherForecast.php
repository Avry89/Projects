<?php
  ini_set('display_errors', 'On');
  error_reporting(E_ALL);

  $countryCode = $_POST['countryCode'];
  $username = "bavram"; 

  // fetch country info from Geonames API
  $url="http://api.geonames.org/countryInfoJSON?formatted=true&country={$countryCode}&username={$username}";

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_URL, $url);

  $result = curl_exec($ch);
  $decode = json_decode($result, true);

  $capital = $decode['geonames'][0]['capital'];

  // get latitude and longitude for the capital of the country
  $url="http://api.geonames.org/searchJSON?q={$capital}&maxRows=1&username={$username}";

  curl_setopt($ch, CURLOPT_URL, $url);
  $result = curl_exec($ch);
  $decode = json_decode($result, true);

  $lat = $decode['geonames'][0]['lat'];
  $lng = $decode['geonames'][0]['lng'];

  // use the fetched coordinates to get weather data from OpenWeather API
  $apiKey = '7ebb7cf0ddf73f176c24bf29e5c7fd5f'; 
  $weatherUrl = "http://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lng}&appid={$apiKey}&units=metric";

  curl_setopt($ch, CURLOPT_URL, $weatherUrl);
  $result = curl_exec($ch);
  $decode = json_decode($result, true);

  $main = $decode["main"];
  $weather = $decode["weather"][0];
  $output['data'] = array_merge($main, $weather);

  curl_close($ch);

  // send the result back to the AJAX call
  header('Content-Type: application/json; charset=UTF-8');
  echo json_encode($output);
?>
