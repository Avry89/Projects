<?php
    // Start measuring the execution time
    $executionStartTime = microtime(true);

    // Include the configuration file that contains login details
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

    // Insert a new personnel into the database
    $query = $conn->prepare('INSERT INTO personnel (firstName, lastName, jobTitle, email, departmentID) VALUES (?, ?, ?, ?, ?)');
    $query->bind_param("ssssi", $_REQUEST['firstName'], $_REQUEST['lastName'], $_REQUEST['jobTitle'], $_REQUEST['email'], $_REQUEST['departmentID']);
    $query->execute();

    // Check if the query execution failed
    if (false === $query) {
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

    // Fetch the last inserted ID
    $result = $conn->query('SELECT LAST_INSERT_ID()');
    $row = $result->fetch_assoc();

    // Prepare the success response
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = $row["LAST_INSERT_ID()"];

    // Close the database connection
    $conn->close();

    // Return the success response as JSON
    echo json_encode($output);
