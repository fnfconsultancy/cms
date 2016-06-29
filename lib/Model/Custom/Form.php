<?php

 namespace xepan\cms;

class Model_Custom_Form extends \Model_Table{

 	public $table = 'custom_form'; 

	function init(){
		parent::init();

		$this->hasOne('xepan\hr\Post_Email_MyEmails','emailsetting_id');
		$this->addField('name');
		$this->addField('submit_button_name');

		$this->addField('form_layout')->enum(array('stacked','minimal','horizontal','empty'));
		$this->addField('custom_form_layout_path');
			
		$this->addField('recieve_email')->type('boolean');
		$this->addField('recipient_email')->hint('comma separated multiple email ids ');
		
		$this->addField('auto_reply')->type('boolean');
		$this->addField('email_subject');
		$this->addField('message_body');

		$this->hasMany('xepan\cms\Custom_FormField','custom_form_id');
	}

}
