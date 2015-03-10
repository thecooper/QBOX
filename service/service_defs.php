<?php

function select_parameters_init() {
	return array("table"=>"","columns"=>array(),"group_name"=>"","where"=>array(),"orderby"=>array());
}

function spot_config_request($method) {
	global $successful;

	$spot_parameters = select_parameters_init();

	$spot_parameters["table"] = 'spot_config';

	switch ($method) {
		case 'GET':
			$result = send_select_query($spot_parameters);
			$spot_json = build_json($result,$spot_parameters);
			$spot_parameters["table"] = 'spot_types';
			$result = send_select_query($spot_parameters);
			$spot_type_json = build_json($result,$spot_parameters);

			return $response = "{".$spot_json.",".$spot_type_json."}";
			break;

		default:
			throw_json_error("Requested Method not supported.");
			break;
	}

}

function booking_request($request_method) {
	global $conn, $successful;

	$query_parameters = select_parameters_init();
	$query_parameters["table"] = 'booking';

	switch ($request_method) {
		case "GET":
			//build an array of search parameters if the startDate key exists. It is
			//assumed that if startDate is provided, then endDate will be as well.
			if(array_key_exists("startDate", $_GET)) {
				$query_parameters["where"] = array(array("type"=>'lte',"column"=>'check_in_date',"value"=>inbound_date_format($_GET['endDate'])),
				array("type"=>'gt',"column"=>'check_out_date',"value"=>inbound_date_format($_GET['startDate'])));
				// checkOutDate >= startDate && checkInDate <= endDate
			}

			$query_parameters["group_name"] = 'bookings';

			$results = send_select_query($query_parameters);

			if(is_string($results)) {
				throw_json_error($results);
			}

			$i = 0;

			$json_response = "";

			$json_response .= '{"bookings":';

			$json_response .= "[";
			foreach($results as $result) {
				if($i > 0) { $json_response .= ","; }
				$json_response .= '{';
				$json_response .= '"bookingId":"' . $result["booking_id"] . '",';
				$json_response .= '"spotType":"' . $result["spot_type"] . '",';
				$json_response .= '"name":"' . $result["name"] . '",';
				$json_response .= '"registration":"' . $result["registration"] . '",';
				$json_response .= '"type":"' . $result["type"] . '",';
				$json_response .= '"bookingType":"' . $result["booking_type"] . '",';
				$json_response .= '"country":"' . $result["country"] . '",';
				$json_response .= '"numberNights":"' . $result["number_nights"] . '",';
				$json_response .= '"numberPeople":"' . $result["number_people"] . '",';
				$json_response .= '"checkInDate":"' . outbound_date_format($result["check_in_date"]) . '",';
				$json_response .= '"checkOutDate":"' . outbound_date_format($result["check_out_date"]) . '",';
				$json_response .= '"phoneNumber":"' . $result["phone_number"] . '",';
				$json_response .= '"email":"' . $result["email"] . '",';
				$json_response .= '"phoneNumber":"' . $result["phone_number"] . '",';
				$json_response .= '"amountPaid":"' . $result["amount_paid"] . '",';
				$json_response .= '"payLater":' . ($result["pay_later"] == "0" ? "false" : "true") . ',';

				$payment_parameters = select_parameters_init();

				$payment_parameters["table"] = "payments";
				$payment_parameters["where"] = array(array("type"=>'exact',"column"=>'booking_id',"value"=>$result['booking_id']));

				$payment_results = send_select_query($payment_parameters);

				if(is_string($payment_results)) {
					throw_json_error($payment_results);
				}

				$json_response .= '"payments":[';
				$is_first = true;
				foreach($payment_results as $payment) {
					if(!$is_first) {
						$json_response .= ",";
					}
					$json_response .= "{";
					$json_response .= '"sequence":"' . $payment['payment_seq'] . '"';
					$json_response .= ',"type":"' . $payment['payment_type'] . '"';
					$json_response .= ',"amount":"' . $payment['payment_amount'] . '"';
					$json_response .= ',"timestamp":"'.$payment['payment_timestamp'].'"';
					$json_response .= ',"status":"old"';
					$json_response .= "}";
					$is_first = false;
				}

				$json_response .= '],';

				$spot_parameters = select_parameters_init();

				$spot_parameters["table"] = 'spot';
				$spot_parameters["group_name"] = 'spots';
				$spot_parameters["where"] = array(array("type"=>'exact',"column"=>'booking_id',"value"=>$result['booking_id']));

				$spot_request = send_select_query($spot_parameters);

				if(is_string($spot_request)) {
					throw_json_error($spot_request);
				}

				$json_response .= '"spots":[';
				$is_first = true;
				foreach($spot_request as $spot) {
					if(!$is_first) {
						$json_response .= ",";
					}
					$json_response .= "{";
					$json_response .= '"occupiedDate":"' . $spot['occupied_date'] . '"';
					$json_response .= ',"type":"' . $spot["type"] . '"';
					$json_response .= ',"number":"' . $spot['number'] . '"';
					$json_response .= ',"status":"old"';
					$json_response .= "}";
					$is_first = false;
				}

				$json_response .= '],';

				$json_response .= '"notes":"' . $result["notes"] . '"';

				$json_response .= '}';
				$i++;
			}
			$json_response .= "]";
			$json_response .= '}';

			return $json_response;

			break;
		case "POST":
			global $first_path_split, $RESTPath, $_POST;

			$booking_id = 0;
			$booking = getDataPost();

			// var_dump($booking);

			$payments = $booking['payments'];
			$spots = $booking['spots'];

			//---------------------------------------MAKE POST TRANSACTIONAL??

			if(validate_booking_parameters($booking)) {
				//update POST parameters
				if($booking["bookingType"] == "New Reservation")
					$booking["bookingType"] = "Reservation";
				else if ($booking["bookingType"] == "New Booking")
					$booking["bookingType"] = "Booking";

				$parameters = [$booking['bookingId'],$booking['name'],$booking['spotType'],$booking["type"],$booking['bookingType'],$booking['country'],$booking['numberNights'],$booking['numberPeople'],$booking['email'],$booking['phoneNumber'],$booking['checkInDate'],$booking['checkOutDate'],$booking['amountPaid'],$booking['payLater'],$booking['registration'],$booking['notes']];
				$edit_columns = ['booking_id','name','spot_type','type','booking_type','country','number_nights','number_people','email','phone_number','check_in_date','check_out_date','amount_paid','pay_later','registration','notes'];

				if($booking["bookingId"] !== "") {
					//UPDATE Statement
					$booking_id = $booking['bookingId'];
					$id_column = 'booking_id';
					$result = send_update_query($query_parameters["table"],$edit_columns,$parameters,$id_column,$booking_id);
					if($result !== true) {
						throw_json_error($result);
					}
				} else {
					//INSERT Statement
					$result = send_insert_query($query_parameters["table"],$edit_columns,$parameters);
					if(!is_string($result)) {
						$booking_id = $result;
					} else {
						throw_json_error($result);
					}
				}

				//Validation checking here
				$table = 'payments';
				$columns = ['payment_type','payment_amount','payment_seq','payment_timestamp','booking_id'];
				foreach($payments as $payment) {
					if($payment['status'] == "new") {
						$parameters = [$payment['type'],$payment['amount'],$payment['sequence'],$payment['timestamp']];
						array_push($parameters, $booking_id);
						$result = send_insert_query($table,$columns,$parameters);
						if(is_string($result)) {
							throw_json_error($result);
						}
					}
				}

				$table = 'spot';
				$columns = ['type','number','occupied_date','booking_id'];
				$where = "booking_id = '" . $booking_id . "'";
				//Delete all previous spots made for booking. Possibly to change later
				//if changing a reservation makes a new booking (for historical purposes).
				if(($delete = send_delete_query($table,$where)) !== true) {
					throw_json_error($delete);
				}

				foreach($spots as $spot) {
					$parameters = [$spot['type'],$spot['number'],inbound_date_format($spot['occupiedDate']),$booking_id];
					array_push($parameters, $booking_id);
					$result = send_insert_query($table,$columns,$parameters);
					if(is_string($result)) {
						throw_json_error($result);
					}
				}

				return '{"result":"successful","bookingId":"' . $booking_id . '"}';
			}

			//$statement = $conn->prepare("");
			break;
		default:
			throw_json_error('Request Method not supported.');
			break;
	}
}

function availability_request($request_method) {
	global $successful;

	$spot_parameters = select_parameters_init();

	$spot_parameters["table"] = 'spot';

	switch ($request_method) {
		case "GET":
			$columns = "occupied_date,type,number";
			if(array_key_exists("startDate", $_GET) && array_key_exists("endDate",$_GET)) {
				$spot_parameters["where"] = array(
					array("type"=>"between","column"=>"occupied_date","first_value"=>inbound_date_format($_GET['startDate']),"second_value"=>inbound_date_format($_GET['endDate']))
					);
				if(array_key_exists("type", $_GET))
					array_push($spot_parameters["where"], array("type"=>"exact","column"=>"type","value"=>$_GET["type"]));
			} else {
				throw_json_error("Valid startDate and endDate values not provided");
			}

			$spot_parameters["orderby"] = array("occupied_date","type");

			$result = send_select_query($spot_parameters);

			if(is_string($result)) {
				throw_json_error($result);
			}

			$json_response = '{"spotCounts":[';
			$j = 0;
			foreach($result as $row) {
				if($j > 0) { $json_response .= ","; }
				$json_response .= '{';
				$json_response .= '"occupiedDate":"' . outbound_date_format($row['occupied_date']) . '"';
				$json_response .= ',"type":"' . $row["type"] . '"';
				$json_response .= ',"number":"' . $row['number'] . '"';
				$json_response .= '}';
				$j++;
			}
			$json_response .= ']}';
			return $json_response;

		break;
		default:
			throw_json_error('Request Method not supported.');
			break;
	}
}

function search_request($request_method) {

	$spot_parameters = select_parameters_init();
	$spot_parameters["table"] = 'booking';
	$spot_parameters["where"] = array();

	if(array_key_exists("q", $_GET)) {
		array_push($spot_parameters["where"], array("type"=>"loose","column"=>"name","value"=>$_GET["q"],"logic"=>"OR"));
		array_push($spot_parameters["where"], array("type"=>"loose","column"=>"registration","value"=>$_GET["q"],"logic"=>"OR"));
		array_push($spot_parameters["where"], array("type"=>"loose","column"=>"type","value"=>$_GET["q"],"logic"=>"OR"));
	}

	switch($request_method) {
		case "GET":

			$results = send_select_query($spot_parameters);

			if(is_string($results)) {
				throw_json_error($results);
			}

			$i = 0;

			$json_response = "";

			$json_response .= '{"bookings":';

			$json_response .= "[";
			foreach($results as $result) {
				if($i > 0) { $json_response .= ","; }
				$json_response .= '{';
				$json_response .= '"bookingId":"' . $result["booking_id"] . '",';
				$json_response .= '"spotType":"' . $result["spot_type"] . '",';
				$json_response .= '"name":"' . $result["name"] . '",';
				$json_response .= '"registration":"' . $result["registration"] . '",';
				$json_response .= '"type":"' . $result["type"] . '",';
				$json_response .= '"bookingType":"' . $result["booking_type"] . '",';
				$json_response .= '"country":"' . $result["country"] . '",';
				$json_response .= '"numberNights":"' . $result["number_nights"] . '",';
				$json_response .= '"numberPeople":"' . $result["number_people"] . '",';
				$json_response .= '"checkInDate":"' . outbound_date_format($result["check_in_date"]) . '",';
				$json_response .= '"checkOutDate":"' . outbound_date_format($result["check_out_date"]) . '",';
				$json_response .= '"phoneNumber":"' . $result["phone_number"] . '",';
				$json_response .= '"email":"' . $result["email"] . '",';
				$json_response .= '"phoneNumber":"' . $result["phone_number"] . '",';
				$json_response .= '"amountPaid":"' . $result["amount_paid"] . '",';
				$json_response .= '"payLater":' . ($result["pay_later"] == "0" ? "false" : "true") . ',';

				$payment_parameters = select_parameters_init();

				$payment_parameters["table"] = "payments";
				$payment_parameters["where"] = array(array("type"=>'exact',"column"=>'booking_id',"value"=>$result['booking_id']));

				$payment_results = send_select_query($payment_parameters);

				if(is_string($payment_results)) {
					throw_json_error($payment_results);
				}

				$json_response .= '"payments":[';
				$is_first = true;
				foreach($payment_results as $payment) {
					if(!$is_first) {
						$json_response .= ",";
					}
					$json_response .= "{";
					$json_response .= '"sequence":"' . $payment['payment_seq'] . '"';
					$json_response .= ',"type":"' . $payment['payment_type'] . '"';
					$json_response .= ',"amount":"' . $payment['payment_amount'] . '"';
					$json_response .= ',"timestamp":"'.$payment['payment_timestamp'].'"';
					$json_response .= ',"status":"old"';
					$json_response .= "}";
					$is_first = false;
				}

				$json_response .= '],';

				$spot_parameters = select_parameters_init();

				$spot_parameters["table"] = 'spot';
				$spot_parameters["group_name"] = 'spots';
				$spot_parameters["where"] = array(array("type"=>'exact',"column"=>'booking_id',"value"=>$result['booking_id']));

				$spot_request = send_select_query($spot_parameters);

				if(is_string($spot_request)) {
					throw_json_error($spot_request);
				}

				$json_response .= '"spots":[';
				$is_first = true;
				foreach($spot_request as $spot) {
					if(!$is_first) {
						$json_response .= ",";
					}
					$json_response .= "{";
					$json_response .= '"occupiedDate":"' . $spot['occupied_date'] . '"';
					$json_response .= ',"type":"' . $spot["type"] . '"';
					$json_response .= ',"number":"' . $spot['number'] . '"';
					$json_response .= ',"status":"old"';
					$json_response .= "}";
					$is_first = false;
				}

				$json_response .= '],';

				$json_response .= '"notes":"' . $result["notes"] . '"';

				$json_response .= '}';
				$i++;
			}
			$json_response .= "]";
			$json_response .= '}';

			return $json_response;
			break;
		default:
			throw_json_error('Request Method not supported');
	}
}
?>