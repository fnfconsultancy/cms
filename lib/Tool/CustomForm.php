<?php 

namespace xepan\cms;

class Tool_CustomForm extends \xepan\cms\View_Tool{
	public $options = ['customformid'=>0, 'template'=>''];
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

		if($this->options['template'])			
			$form->setLayout('view/tool/form/'.$this->options['template']);

		foreach ($customform_field_model as $field) {

			if($field['type'] === "email"){

				$new_field = $form->addField("line",$field['name']);
				$new_field->validate('email');
			}else if($field['type'] === "Captcha"){				
				$new_field = $form->addField('line','captcha',$field['name']);
				$new_field->add('xepan\captcha\Controller_Captcha');
			}else{
				$new_field = $form->addField($field['type'],$field['name']);
			}
			
			if($field['type'] === "DropDown" or $field['type'] === "radio"){
				$field_array = explode(",", $field['value']);
				$new_field->setValueList($field_array);
			}

			if($field['is_mandatory'])
				$new_field->validate('required');
		}				
		
		$this->form->addSubmit($customform_model['submit_button_name']);

		if($this->form->isSubmitted()){
			if($form->hasElement('captcha') && !$form->getElement('captcha')->captcha->isSame($form['captcha'])){
				$form->displayError('captcha','wrong Captcha');	
			}
			$model_submission = $this->add('xepan\cms\Model_Custom_FormSubmission');
			$form_fields = $form->getAllFields();
			
			$model_submission['value'] = $form_fields;
			$model_submission['custom_form_id'] = $this->options['customformid'];
			$model_submission->save();

			if($customform_model['emailsetting_id']){
				$communication = $this->add('xepan\communication\Model_Communication_Email_Sent');
				$email_settings = $this->add('xepan\communication\Model_Communication_EmailSetting')->load($customform_model['emailsetting_id']);

				$communication->setfrom($email_settings['from_email'],$email_settings['from_name']);
				$communication->addTo($customform_model['recipient_email']);
				$communication->setSubject('You have a new enquiry');
				$communication->setBody($model_submission['value']);
				$communication->send($email_settings);

				if($customform_model['auto_reply']){
					$email_settings = $this->add('xepan\communication\Model_Communication_EmailSetting')->load($customform_model['emailsetting_id']);	
					$communication1 = $this->add('xepan\communication\Model_Communication_Email_Sent');
					$to_array = [];
					foreach ($customform_field_model as $field) {
						if( !($field['type'] == "email" and $field['auto_reply']))
							continue;

						$to_array[] = $this->form[$field['name']];
					}

					
					foreach ($to_array as $email) {
						$communication1->setfrom($email_settings['from_email'],$email_settings['from_name']);
						$communication1->addTo($email);
						$communication1->setSubject($customform_model['email_subject']);
						$communication1->setBody($customform_model['message_body']);
						$communication1->send($email_settings);					
					}

				}
			}
			$form->js(null,$form->js()->reload())->univ()->successMessage("Thank you for enquiry")->execute();
		}
	}

	function getTemplate(){
		if($this->options['template'])
			return $this->form->layout->template;
		return $this->form->template;
	}

}