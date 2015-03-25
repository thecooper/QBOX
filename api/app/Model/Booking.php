<?php
class Booking extends AppModel {
	public $id;
	public $spot_type;
	public $name;
	public $type;
	public $booking_type;
	public $country;
	public $number_nights;
	public $numper_people;
	public $make;
	public $model;
	public $email;
	public $phone_number;
	public $check_in_date;
	public $check_out_date;
	public $amount_paid;
	public $pay_later;
	public $registration;
	public $notes;
	public $hasMany = array(
		"Payment" => array(

			),
		"Spot" => array(

			)
		);
}
?>