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

    // Check if there are people associated with the department
    $query = $conn->prepare('SELECT count(p.id) as departmentCount, d.name as departmentName FROM personnel p LEFT JOIN department d ON ( d.id = p.departmentID) WHERE d.id = ?');
    $query->bind_param("i", $_REQUEST['id']);
    $query->execute();
    $result = $query->get_result();

    if ($result->fetch_assoc()["peopleCount"] > 0) {
        // Prepare the error response for integrity error
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "integrity error";
        $output['data'] = [];

        // Close the database connection
        $conn->close();

        // Return the error response as JSON and stop further execution
        echo json_encode($output);
        exit;
    }

    // Delete the department
    $query = $conn->prepare('DELETE FROM department WHERE id = ?');
    $query->bind_param("i", $_REQUEST['id']);
    $query->execute();

    // Check if the query execution failed
    if (!$query) {
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

    // Select count of personnel for the department
    $selectQuery = $conn->prepare('SELECT COUNT(p.id) as departmentCount, d.name as departmentName FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID) WHERE d.id = ?');
    $selectQuery->bind_param("i", $_REQUEST['id']);
    $selectQuery->execute();
    $selectResult = $selectQuery->get_result();
    $data = $selectResult->fetch_assoc();

    // Check if the select query execution failed
    if (!$selectResult) {
        // Prepare the error response
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "select query failed";
        $output['data'] = [];

        // Close the database connection
        $conn->close();

        // Return the error response as JSON and stop further execution
        echo json_encode($output);
        exit;
    }

    // Prepare the success response
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data']['departmentCount'] = $data['departmentCount'];
    $output['data']['departmentName'] = $data['departmentName'];
    $output['data']['deletedDepartmentID'] = $_REQUEST['id'];

    // Close the database connection
    $conn->close();

    // Return the success response as JSON
    echo json_encode($output);
