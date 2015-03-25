<?php

class PaymentController extends AppController {

	public $components = array('RequestHandler');

	public function index() {
        if(array_key_exists('startDate', $this->request->query) && array_key_exists('endDate', $this->request->query)) {
            $startDate = $this->inbound_date_format($this->request->query['startDate']);
            $endDate = $this->inbound_date_format($this->request->query['endDate']);
            $payments = $this->Payment->find('all',array(
                'conditions'=>array('occupied_date >='=>$startDate,'occupied_date <='=>$endDate)));
        } else {
    		$payments = $this->Payment->find('all');
        }
		$this->set(array(
			'payments' => $payments,
			'_serialize' => array('payments')
			));
	}

	public function delete($id) {
		if ($this->Payment->delete($id,true)) {
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