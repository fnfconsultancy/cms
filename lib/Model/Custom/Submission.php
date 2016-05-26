<?php

 namespace xepan\cms;

class Model_Custom_Submission extends \Model_Table{

 	public $table = 'custom_form_submission'; 

	function init(){
		parent::init();

		$this->hasOne('xepan\cms\Custom_Form','custom_form_id');
		$this->addField('value')->type('text');
	}

}
