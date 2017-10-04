<?php

namespace xepan\cms;

class page_sefconfig extends \xepan\base\Page{
	public $title = "SEF Config";

	function init(){
		parent::init();

		$config = $this->add('xepan\base\Model_ConfigJsonModel',
			[
				'fields'=>[
							'enable_sef'=>'checkbox'
						],
					'config_key'=>'SEF_Enable',
					'application'=>'cms'
		]);
		// $config->add('xepan\hr\Controller_ACL');
		$config->tryLoadAny();

		$form = $this->add('Form');
		$form->addField('checkbox','enable_sef')->set($config['enable_sef']);
		$form->addSubmit('save');
		if($form->isSubmitted()){
			$config['enable_sef'] = $form['enable_sef'];
			$config->save();
			$form->js(null,$form->js()->reload())->univ()->successMessage('Saved Successfully')->execute();
		}

		$config = $this->add('xepan\base\Model_ConfigJsonModel',
			[
				'fields'=>[
							'expression'=>'line',
							'page_name'=>'line',
							'param'=>'text'
						],
					'config_key'=>'SEF_List',
					'application'=>'cms'
		]);

		// $config->add('xepan\hr\Controller_ACL');
		$config->tryLoadAny();
		
		$crud = $this->add('CRUD',['entity_name'=>" SEF List"]);
		// $crud->add_button = "sd";
		$crud->setModel($config,['expression','page_name','param']);

	}
}