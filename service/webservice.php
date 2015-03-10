<?php

$successful = '{"result":"successful"}';

require_once('functions.php');
require_once('service_defs.php');

$request_method = $_SERVER["REQUEST_METHOD"];

$RESTPath = $_SERVER["PATH_INFO"];

$conn = open_database_connection();

$first_path = get_first_path($RESTPath);

//Main switch that dictates which service is being called
switch($first_path) {
	case "booking":
		echo booking_request($request_method);
		break;
	case "search":
		echo search_request($request_method);
		break;
	case "availability":
		echo availability_request($request_method);
		break;
	case "config":
		echo spot_config_request($request_method);
		break;
	case "search":
		echo search_request($request_method);
	default:
		throw_json_error("Service request is not supported.");
		break;
}

$conn->close();
?>