<?php

 namespace xepan\cms;

 class Model_Custom_Form extends \SQL_Model{

 	public $table = 'custom_form'; 

	function init(){
		parent::init();

		$this->addField('name');
		$this->addField('submit_button_name');

		$this->addField('form_layout')->enum(array('stacked','minimal','horizontal','empty'));
		$this->addField('custom_form_layout_path');
			
		$this->addField('recieve_email')->type('boolean');
		$this->addField('recipient_email')->hint('comma separated multiple email ids ');

		$this->hasMany('xepan\cms\Custom_FormField','custom_form_id');
	}

}
