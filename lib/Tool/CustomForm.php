<?php 

namespace xepan\cms;

class Tool_CustomForm extends \xepan\cms\View_Tool{
	public $options = ['customformid'=>0];
	public $form;
	public $customform_model;
	public $customform_field_model;

	function init(){
		parent::init();

		if(!$this->options['customformid']){
			$this->add("View_Error")->set('please select any custom form');
			return;
		}

		$customform_model = $this->add('xepan\cms\Model_Custom_Form')
								->tryLoad($this->options['customformid']);
		
		if(!$customform_model->loaded()){
			$this->add('View_Error')->set('no such form found...');
			return;
		}

		$customform_field_model = $this->add('xepan\cms\Model_Custom_FormField')
												->addCondition('custom_form_id',$customform_model->id);
		
		if(!$customform_field_model->count()->getOne()){
			$this->add("View_Warning")->set('add form fields...');
			return;
		}

		$this->form = $this->add('Form');
		$form = $this->form;

		foreach ($customform_field_model as $field) {

			$new_field = $form->addField($field['type'],$field['name']);
			if($field['is_mandatory'])
				$new_field->validate('required');
			if($field['type'] == "DropDown"){
				
				$field_array = explode(",", $field['value']);

				$new_field->setValueList($field_array);
			}

		}
		
		$this->form->addSubmit($customform_model['submit_button_name']);

		if($this->form->isSubmitted()){

			if($customform_model['auto_reply']){
				foreach ($customform_field_model as $mail) {
					$name = $mail['name'];
					$dob = $mail['type'];
				}
				
			}

			// echo $name;
			// echo $dob;
		}
	}
}