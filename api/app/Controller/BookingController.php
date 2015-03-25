<?php

class BookingController extends AppController {

	public $components = array('RequestHandler');

	public function index() {
		if(array_key_exists('startDate', $this->request->query) && array_key_exists('endDate', $this->request->query)) {
            $startDate = $this->inbound_date_format($this->request->query['startDate']);
            $endDate = $this->inbound_date_format($this->request->query['endDate']);
            $bookings = $this->Booking->find('all',array(
                'conditions'=>array('check_out_date >'=>$startDate,'check_in_date <='=>$endDate)));
        } else {
            $bookings = $this->Booking->find('all');
        }
        $newBooking = array();
        foreach($bookings as $booking) {
            $spots = $booking["Spot"];
            $payments = $booking["Payment"];
            $booking = $booking["Booking"];
            $booking['spots'] = $spots;
            $booking['payments'] = $payments;
            $booking['check_in_date'] = BookingController::outbound_date_format($booking['check_in_date']);
            $booking['check_out_date'] = BookingController::outbound_date_format($booking['check_out_date']);
            foreach($payments as &$payment) {
                $payment['payment_timestamp'] = BookingController::outbound_date_format($payment['payment_timestamp']);
            }
            foreach($spots as &$spot) {
                $spot['occupied_date'] = BookingController::outbound_date_format($spot['occupied_date']);
            }
            array_push($newBooking, $booking);
        }
		$this->set(array(
			'bookings' => $newBooking,
			'_serialize' => array('bookings')
			));
	}

	public function edit($id) {
		$this->Booking->id = $id;
        $booking = $this->request->input('json_decode',true);
        $payments = $booking["payments"];
        $spots = $booking["spots"];
        unset($booking["payments"]);
        unset($booking["spots"]);

        $booking['check_in_date'] = BookingController::inbound_date_format($booking['check_in_date']);
        $booking['check_out_date'] = BookingController::inbound_date_format($booking['check_out_date']);
        foreach($payments as &$payment) {
            $payment['payment_timestamp'] = BookingController::inbound_date_format($payment['payment_timestamp']);
        }
        foreach($spots as &$spot) {
            $spot['occupied_date'] = BookingController::inbound_date_format($spot['occupied_date']);
        }
        if ($this->Booking->saveAssociated(array(
                'Booking'=>$booking,
                'Payment'=>$payments,
                'Spot'=>$spots
            ))) {
            $message = 'Saved';
        } else {
            $message = 'Error';
        }
        $this->set(array(
            'message' => $message,
            '_serialize' => array('message')
        ));
	}

	public function view($id) {
        $this->Booking->recursive = 3;
		$booking = $this->Booking->findById($id);

		$this->set(array(
			'booking'=>$booking,
			'_serialize'=>array('booking')
			));
	}

	public function add() {
		$this->Booking->create();
        $booking = $this->request->input('json_decode',true);
        $payments = $booking["payments"];
        $spots = $booking["spots"];
        unset($booking["payments"]);
        unset($booking["spots"]);
        $booking['booking_type'] = "Booking";
        $booking['check_in_date'] = BookingController::inbound_date_format($booking['check_in_date']);
        $booking['check_out_date'] = BookingController::inbound_date_format($booking['check_out_date']);
        foreach($payments as &$payment) {
            $payment['payment_timestamp'] = BookingController::inbound_date_format($payment['payment_timestamp']);
        }
        foreach($spots as &$spot) {
            $spot['occupied_date'] = BookingController::inbound_date_format($spot['occupied_date']);
        }
        if ($this->Booking->saveAssociated(array(
                'Booking'=>$booking,
                'Payment'=>$payments,
                'Spot'=>$spots
            ))) {
            $message = 'Saved';
            $id = $this->Booking->id;
        } else {
            $message = 'Error';
        }

        $this->set(array(
            'message' => $message,
            'id' => $id,
            '_serialize' => array('message','id')
        ));
	}

	public function delete($id) {
		if ($this->Booking->delete($id,true)) {
            $message = 'Deleted';
        } else {
            $message = 'Error';
        }
        $this->set(array(
            'message' => $message,
            '_serialize' => array('message')
        ));
	}
}

?>