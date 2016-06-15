<?php

namespace xepan\cms;

class page_sitemetainfo extends \xepan\base\Page{
	public $title = "Website Meta Info";
	public $breadcrumb=[
						'Dashboard'=>'/','Website'=>'xepan_cms_websites'
					];

	function init(){
		parent::init();

		$epan = $this->add('xepan\epanservices\Model_Epan')->load($this->app->epan->id);
		$extra_info = json_decode($epan['extra_info']);

		$form = $this->add('Form');
		$form->addField('title')->set($extra_info['title'][]);
		$form->addField('meta_keyword')->set($extra_info['title'][]);
		$form->addField('meta_description')->set($extra_info['title'][])->addClass('xepan-push');
		$form->addSubmit('Save')->addClass('btn btn-primary btn-block');

		if($form->isSubmitted()){

		}
	}
}