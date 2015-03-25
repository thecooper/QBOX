<?php

class SpotController extends AppController {

	public $components = array('RequestHandler');

	public function index() {
        if(array_key_exists('startDate', $this->request->query) && array_key_exists('endDate', $this->request->query)) {
            $startDate = $this->inbound_date_format($this->request->query['startDate']);
            $endDate = $this->inbound_date_format($this->request->query['endDate']);
            $spots = $this->Spot->find('all',array(
                'conditions'=>array('occupied_date >='=>$startDate,'occupied_date <='=>$endDate)));
        } else {
    		$spots = $this->Spot->find('all');
        }
        foreach($spots as &$spot) {
            $spot['Spot']['occupied_date'] = $this->outbound_date_format($spot['Spot']['occupied_date']);
        }
		$this->set(array(
			'spots' => $spots,
			'_serialize' => array('spots')
			));
	}

	public function edit($id) {
		$this->Spot->id = $id;
        $spot = $this->request->input('json_decode',true);

        if ($this->Spot->save()) {
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
        $this->Spot->recursive = 3;
		$spot = $this->Spot->findById($id);

		$this->set(array(
			'spot'=>$spot,
			'_serialize'=>array('spot')
			));
	}

	public function add() {
		$this->Spot->create();

        $spot = $this->request->input('json_decode',true);
        if ($this->Spot->save($spot)) {
            $message = 'Saved';
            $id = $this->Spot->id;
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
		if ($this->Spot->delete($id,true)) {
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