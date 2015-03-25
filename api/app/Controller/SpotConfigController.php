<?php

class spotConfigController extends AppController {

	public $components = array('RequestHandler');

	public function index() {
        if(array_key_exists('startDate', $this->request->query) && array_key_exists('endDate', $this->request->query)) {
            $startDate = $this->inbound_date_format($this->request->query['startDate']);
            $endDate = $this->inbound_date_format($this->request->query['endDate']);
            $spotConfigs = $this->spotConfig->find('all',array(
                'conditions'=>array('occupied_date >='=>$startDate,'occupied_date <='=>$endDate)));
        } else {
    		$spotConfigs = $this->spotConfig->find('all');
        }
		$this->set(array(
			'spotConfigs' => $spotConfigs,
			'_serialize' => array('spotConfigs')
			));
	}

	public function edit($id) {
		$this->spotConfig->id = $id;
        $spotConfig = $this->request->input('json_decode',true);

        if ($this->spotConfig->save()) {
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
        $this->spotConfig->recursive = 3;
		$spotConfig = $this->spotConfig->findById($id);

		$this->set(array(
			'spotConfig'=>$spotConfig,
			'_serialize'=>array('spotConfig')
			));
	}

	public function add() {
		$this->spotConfig->create();

        $spotConfig = $this->request->input('json_decode',true);
        if ($this->spotConfig->save($spotConfig)) {
            $message = 'Saved';
            $id = $this->spotConfig->id;
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
		if ($this->spotConfig->delete($id,true)) {
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