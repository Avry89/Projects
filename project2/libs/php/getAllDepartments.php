<?php
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

// Get the search parameter
$search = $_GET['search'];

// Prepare the query with the search condition
$query = "SELECT d.id, COUNT(p.id) as num_of_employees, d.name as name, l.name as location, d.locationID 
          FROM personnel p 
          RIGHT JOIN department d ON (d.id = p.departmentID) 
          LEFT JOIN location l ON (l.id = d.locationID) 
          WHERE d.name LIKE '%$search%' OR l.name LIKE '%$search%'
          GROUP BY d.id 
          ORDER BY name";

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
