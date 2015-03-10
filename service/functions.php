<?php 

header('Content-Type: application/json');

$testing = true;

class service_error {	
}

function throw_json_error($errmsg) {
	global $testing;
	$generic_error = "There was a technical difficulty";
	echo '{"result":"error","error":"'.($testing?$errmsg:$generic_error).'"}';
	exit();
}

function toCamelFormat($str) {
	$s = "";
	$sArr = preg_split('/_/', $str);
	if(count($sArr) == 1)
		return $str;
	$s = $sArr[0];
	for ($i=1; $i < count($sArr); $i++) {
		//capitalize first letter of each place after underscore and append the new word
		//to the temp string
		$s .= strtoupper(substr($sArr[$i], 0,1)).substr($sArr[$i],1,strlen($str));
	}
	return $s;
}

function toUnderscoreFormat($str) {

}

function getDataPost() {
	$input = file_get_contents('php://input');
	$object = json_decode($input,true);
	return $object;
}

function build_json($data,$params) {
	if(!is_array($data))
		throw_json_error("Data passed to build_json is not an array of results.");

	$json_response = '"'.toCamelFormat($params["table"]).'":';
	
	if(count($data) == 0)
		return $json_response . '[]';

	$json_response .= "[";

	$first_row = true;
	foreach($data as $row) {
		if(!$first_row) { $json_response .= ","; }
		$first_row=false;
		$first_column = true;
		$json_response .= "{";
		foreach($row as $column => $value) {
			if(!$first_column) { $json_response .= ",";}
			$first_column=false;
			$json_response .= '"'.toCamelFormat($column).'":"'.$value.'"';
		}
		$json_response .= "}";
	}
	
	$json_response .= "]";

	return $json_response;
}

function get_first_path($path) {
	$first_path_preg_split = preg_split("/\//",$path);
	$first_path = "";

	if (count($first_path_preg_split) <= 0) {
		throw_json_error("No path elements.");
	} else {
		return $first_path_preg_split[1];
	}
}

function open_database_connection() {
	$servername = "localhost";
	$username = "root";
	$password = "";
	// Create connection
	$conn = new mysqli($servername, $username, $password);

	// Check connection
	if ($conn->connect_error) {
	    die("Connection failed: " . $conn->connect_error);
	}

	if($conn->select_DB("qbox") === false) {
		die("No such database: " . $conn->connect_error);
	}

	return $conn;
}

function validate_booking_parameters($data_object) {
	//validation for booking POSTs here
	return true;
}

function validate_spot_parameters($spots) {
	return true;
}

function validate_payment_parameters($payments) {
	return true;
}

function inbound_date_format($date) {
	if(($date_check = date_create($date)) !== false) {
		//Code to convert dates submitted to acceptable format for MySQL to handle...
		if($date != "") {
			$date = $date_check->format('Y-m-d');
		}
	}
	return $date;
}

function outbound_date_format($date) {
	if(($date_check = date_create($date)) !== false) {
		//Code to convert dates submitted to acceptable format for MySQL to handle...
		if($date != "") {
			$date = $date_check->format('m/d/Y');
		}
	}
	return $date;
}

function send_select_query($parameters) {
	global $conn;
	$query = "SELECT ";

	//TODO: make this function secure using parameters
	if(count($parameters["columns"]) > 0) {
		$i = 0;
		foreach($parameters["columns"] as $column) {
			if($i > 0) { $query .= ","; }
			$query .= $column;
			$i++;
		}
	} else {
		$query .= "*";
	}

	$query .= " FROM {$parameters['table']}";

	if(count($parameters["where"]) > 0) {
		//Generate WHERE statement based on $search_params
		$search_query = " WHERE ";
		foreach($parameters["where"] as $param) {
			if($search_query != " WHERE ")
				if(array_key_exists("logic", $param)) {
					$search_query .= " {$param['logic']} ";
				} else {
					$search_query .= " AND ";
				}
				
			switch($param["type"]) {
				case "loose":
					$search_query .= $param['column'] . " LIKE '%" . $param['value'] . "%'";
					break;
				case "exact":
					$search_query .= $param['column'] . " = '" . $param['value'] . "'";
					break;
				case "between":
					$search_query .= $param['column'] . " BETWEEN '" . $param['first_value'] . "' AND '" . $param['second_value'] . "'";
					break;
				case "gte":
					$search_query .= $param['column'] . " >= '" . $param['value'] . "'";
					break;
				case "gt":
					$search_query .= $param['column'] . " > '" . $param['value'] . "'";
					break;
				case "lte":
					$search_query .= $param['column'] . " <= '" . $param['value'] . "'";
					break;
				case "lt":
					$search_query .= $param['column'] . " < '" . $param['value'] . "'";
					break;
			}
		}
		$query .= $search_query;
	}

	//Generate 
	if(is_array($parameters["orderby"])) {
		if(count($parameters["orderby"]) > 0) {
			$orderby = "ORDER BY ";
			foreach($parameters["orderby"] as $col) {
				if($orderby != "ORDER BY ")
					$orderby .= ",";
				$orderby .= $col;
			}
		}
	} else {
		throw_json_error("error in send_select_query: order by was not passed as an array.");
	}

	// echo $query;

	$result = $conn->query($query);

	if($conn->errno > 0) {
		return $conn->error;
	}

	$r = [];
	while(($row = $result->fetch_assoc()) != NULL) {
		array_push($r,$row);
	}

	return $r;
}

function send_delete_query($table,$where) {
	global $conn;
	$query = "DELETE FROM " . $table . " WHERE " . $where;

	$result = $conn->query($query);

	if($conn->errno > 0) {
		return $conn->error;
	} else {
		return true;
	}
}

function send_insert_query($table,$columns, $parameters) {
	global $conn;

	//Begin Query Generation
	$query = "INSERT INTO $table (";
	$column_cnt = 0;
	
	for($i=0;$i<count($columns);$i++) {
		if($i > 0) { $query = $query.","; }
		$query .= $columns[$i];
	}

	$query .= ") VALUES (";

	for($i=0;$i<count($columns);$i++) {
		if($i > 0) { $query = $query.","; }
		$query .= "?";
	}	

	$query .= ")";

	// echo $query;

	$insert_stmt = $conn->prepare($query);

	//End Query Generation
	//Begin Parameter Binding
	if($insert_stmt === false) {
		return $conn->error .".";
	}

	// var_dump($parameters);

	$params = $parameters;
	$param_types = "";
	$ref_params = [];

	//generate type string for parameter binding in mysqli_bind_parameter()
	//Also, build new array of reference values based on params[] array.
	for($i=0;$i<count($columns);$i++) {
		if(is_numeric($parameters[$i])) {
			$param_types = $param_types . "i";
		} else {
			$param_types = $param_types . "s";
			$params[$i] = inbound_date_format($params[$i]);
		}

		$ref_params[$i] = &$params[$i];
	}

	// var_dump($params);

	//Add generated type string to the front of the $ref_params array, passed to call_user_func_array
	array_unshift($ref_params, $param_types);

	call_user_func_array(array($insert_stmt,"bind_param"), $ref_params);
	//End Parameter Binding
	
	$insert_stmt->execute();

	if($insert_stmt->errno != 0) {
		return $insert_stmt->error;
	} else {
		return $insert_stmt->insert_id;
	}
}

function send_update_query($table,$columns, $parameters, $id_column, $id) {
	global $conn;

	//Begin Query Generation
	$query = "UPDATE $table SET ";
	$column_cnt = 0;
	
	for($i=0;$i<count($columns);$i++) {
		if($i > 0) { $query = $query.","; }
		$query = $query . $columns[$i] . "=?";
	}

	$query = $query . " WHERE $id_column=?";
	$update_stmt = $conn->prepare($query);

	//End Query Generation
	
	if($update_stmt->errno != 0) {
		return $update_stmt->error;
	}

	$params = $parameters;
	$param_types = "";
	$ref_params = [];

	for($i=0;$i<count($columns);$i++) {
		if(is_numeric($parameters[$i])) {
			$param_types = $param_types . "i";
		} else {
			$param_types = $param_types . "s";
			$params[$i] = inbound_date_format($params[$i]);
		}

		$ref_params[$i] = &$params[$i];
	}

	$param_types .= "i";

	array_unshift($ref_params, $param_types);
	$ref_params[count($ref_params)] = &$id;

	// var_dump($ref_params);
	call_user_func_array(array($update_stmt,"bind_param"), $ref_params);	
	
	$update_stmt->execute();

	if($update_stmt->errno != 0) {
		return $update_stmt->error;
	} else {
		return true;
	}
}
?>