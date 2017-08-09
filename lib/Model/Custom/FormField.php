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
								'text'=> 'Text',
								'password' =>'Password',
								'radio'=>'Radio',
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
		$this->addField('auto_reply')->type('boolean');

		$lead_field = [
						'first_name'=>"First Name",
						'last_name'=>'Last Name',
						'organization'=>'Organization',
						'post'=>'Post',
						'website'=>'Website',
						'official_email'=>'Official Email',
						'personal_email'=>'Personal Email',
						'official_contact'=>'Official Contact',
						'personal_contact'=>'Personal Contact',
						'address'=>"Address",
						'city' => "City",
						'state' => "State",
						'country' =>"Country",
						'pin_code'=>"Pincode"
					];

		$this->addField('save_into_field_of_lead')->setValueList($lead_field);
	}

}
