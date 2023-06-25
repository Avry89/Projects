<?php
    // Enable error display
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    // Start measuring the execution time
    $executionStartTime = microtime(true);

    // Include the configuration file
    include("config.php");

    // Set the response header
    header('Content-Type: application/json; charset=UTF-8');

    // Create a new database connection
    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

    // Check if the database connection failed
    if ($conn->connect_errno) {
        // Prepare the error response
        $output['status']['code'] = "300";
        $output['status']['name'] = "failure";
        $output['status']['description'] = "database unavailable";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];

        // Close the database connection
        $conn->close();

        // Return the error response as JSON and stop further execution
        echo json_encode($output);
        exit;
    }

    // Query to fetch data with location information and count of departments
    $query = 'SELECT l.id, COUNT(d.name) as num_of_depts, l.name as name 
              FROM department d 
              RIGHT JOIN location l ON (d.locationID = l.id) 
              GROUP BY l.id 
              ORDER BY name';

    // Execute the query
    $result = $conn->query($query);

    // Check if the query execution failed
    if (!$result) {
        // Prepare the error response
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "query failed";
        $output['data'] = [];

        // Close the database connection
        $conn->close();

        // Return the error response as JSON and stop further execution
        echo json_encode($output);
        exit;
    }

    // Fetch the data from the result set
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    // Prepare the success response
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $data;

    // Close the database connection
    $conn->close();

    // Return the success response as JSON
    echo json_encode($output);
?>
