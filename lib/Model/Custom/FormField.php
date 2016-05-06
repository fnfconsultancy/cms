<?php

 namespace xepan\cms;

 class Model_Custom_FormField extends \Model_Table{ 	

 	public $table = 'custom_form_field'; 

	function init(){
		parent::init();	

		$this->hasOne('xepan\cms\Custom_Form','custom_form_id');

		$this->addField('name');
		$this->addField('type')
					->setValueList(
							array(
								'Number'=>"Number",
								'email'=>'Email',
								'line'=>'Line',
								'text'=> 'text',
								'password' =>'password',
								'radio'=>'radio',
								'checkbox'=>'Checkbox',
								'DropDown'=>'DropDown',
								'DatePicker'=>"DatePicker",
								'upload'=>"Upload",
								'TimePicker'=>"TimePicker",
								"Captcha"=>'Captcha'
							)
						);

		$this->addField('value')->type('text')->hint('comma separated multiple values for dropdown, radio button etc..');
		$this->addField('is_mandatory')->type('boolean');
		$this->addField('hint')->type('text');
		$this->addField('placeholder');

	}

}
