<?php

 namespace xepan\cms;

class Model_Custom_Form extends \xepan\base\Model_Table{

 	public $table = 'custom_form'; 
 	public $status=[
		'Active',
		'InActive'
	];
	public $actions=[
		'Active'=>['view','edit','delete','enquiry','deactivate'],
		'InActive'=>['view','edit','delete','enquiry','activate'],
	];

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
		$this->addField('created_at');
		$this->getElement('created_at')->defaultValue($this->app->now);

		$this->addField('created_by_id');
		$this->getElement('created_by_id')->defaultValue($this->app->employee->id);
		
		$this->addField('type');
		$this->getElement('type')->defaultValue('CustomForm');

		$this->addField('status')->enum($this->status)->mandatory(true)->system(true);

		$this->hasMany('xepan\cms\Custom_FormField','custom_form_id');
	}

	function activate(){
		$this['status']='Active';
		$this->app->employee
            ->addActivity("CustomForm '".$this['name']."' now active", null/* Related Document ID*/, $this->id /*Related Contact ID*/,null,null,"xepan_cms_customform")
            ->notifyWhoCan('deactivate','Active',$this);
		$this->save();
	}

	function deactivate(){
		$this['status']='InActive';
		$this->app->employee
            ->addActivity("CustomForm '".$this['name']."' has deactivated", null/* Related Document ID*/, $this->id /*Related Contact ID*/,null,null,"xepan_cms_customform")
            ->notifyWhoCan('activate','InActive',$this);
		$this->save();
	}

	function page_enquiry($p){
		$custom_form_sub_m = $p->add('xepan\cms\Model_Custom_FormSubmission');		
		$custom_form_sub_m->addCondition('custom_form_id',$this->id);

		$grid = $p->add('Grid');
		$grid->setModel($custom_form_sub_m,['value']);

		// $make_lead = $grid->addColumn('button','Convert');
		$grid->add('VirtualPage')
			->addColumn('Convert')
			->set(function($page){
			$page->add('xepan/marketing/page_leaddetails');
		});
	}
}
