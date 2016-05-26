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

			if($field['type'] === "email"){

				$new_field = $form->addField("line",$field['name']);
				$new_field->validate('email');
			}else
				$new_field = $form->addField($field['type'],$field['name']);
			

			if($field['type'] === "DropDown" or $field['type'] === "radio"){
				$field_array = explode(",", $field['value']);
				$new_field->setValueList($field_array);
			}

			if($field['is_mandatory'])
				$new_field->validate('required');
		}				
		
		$this->form->addSubmit($customform_model['submit_button_name']);

		if($this->form->isSubmitted()){
			
			$model_submission = $this->add('xepan\cms\Model_Custom_FormSubmission');
			$form_fields = $form->getAllFields();
			
			$model_submission['value'] = $form_fields;
			$model_submission['custom_form_id'] = $this->options['customformid'];
			$model_submission->save();

			// for owner
			// if($this->options[''])

			if($customform_model['auto_reply']){
				$communication = $this->add('xepan\communication\Model_Communication_Email_Sent');
				$email_settings = $this->add('xepan\communication\Model_Communication_EmailSetting')->load($customform_model['emailsetting_id']);	
				
				$to_array = [];
				foreach ($customform_field_model as $field) {
					if( !($field['type'] == "email" and $field['auto_reply']))
						continue;

					$to_array[] = $this->form[$field['name']];
				}
				
				foreach ($to_array as $email) {
					$communication->setfrom($email_settings['from_email'],$email_settings['from_name']);
					$communication->addTo($email);
					$communication->setSubject($customform_model['email_subject']);
					$communication->setBody($customform_model['message_body']);
					$communication->send($email_settings);					
				}

			}
			
		}
	}
}