<?php

namespace xepan\cms;

class page_configuration extends \xepan\base\Page{
	public $title = "Configuration";

	function init(){
		parent::init();

		$config_m = $this->add('xepan\base\Model_ConfigJsonModel',
		[
			'fields'=>[
						'site_offline'=>'Line',
						'offline_site_content'=>'xepan\base\RichText',
						'continue_crons'=>'Checkbox',
						],
				'config_key'=>'FRONTEND_WEBSITE_STATUS',
				'application'=>'cms'
		]);
		
		$config_m->add('xepan\hr\Controller_ACL');
		$config_m->tryLoadAny();

		$form = $this->add('Form');
		$form->addField('Dropdown','put_site_offline')->setValueList([true=>'Yes',false=>'No'])->setEmptyText('Please select a value')->set($config_m['site_offline']);
		$form->addField('xepan\base\RichText','offline_content')->set($config_m['offline_site_content']);
		$form->addField('Checkbox','continue_crons')->set($config_m['continue_crons']);
		$form->addSubmit('Save');

		if($form->isSubmitted()){
			$config_m['site_offline'] = $form['put_site_offline'];
			$config_m['offline_site_content'] = $form['offline_content'];
			$config_m['continue_crons'] = $form['continue_crons'];
			$config_m->save();

			$form->js()->univ()->successMessage('Saved')->execute();
		}
	}
}