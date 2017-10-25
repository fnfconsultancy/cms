<?php

namespace xepan\cms;

/**
* 
*/
class Model_ImageGalleryCategory extends \xepan\base\Model_Table{
	public $table = 'xepan_cms_image_gallery_categories';

	function init(){
		parent::init();
		$this->hasOne('xepan\hr\Employee','created_by_id')->defaultValue($this->app->employee->id);
		$this->addField('name')->caption('Category Name');
		$this->addField('status')->enum(['Active','InActive'])->defaultValue('Active');
		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);
		$this->addField('type');
		$this->addCondition('type','ImageGalleryCategory');
		$this->hasMany('xepan\cms\ImageGalleryImages','gallery_cat_id');

		$this->addHook('afterSave',[$this,'updateJsonFile']);
	}

	function updateJsonFile(){

		if(isset($this->app->skipDefaultTemplateJsonUpdate) && $this->app->skipDefaultTemplateJsonUpdate) return;
				
		$path = $this->api->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name."/www/layout";
		if(!file_exists(realpath($path))){
			\Nette\Utils\FileSystem::createDir('./websites/'.$this->app->current_website_name.'/www/layout');
		}

		$master = $this->add('xepan\cms\Model_ImageGalleryCategory')->getRows();
		foreach ($master as &$m) {
			$chield = $this->add('xepan\cms\Model_ImageGalleryImages');
			$chield->addCondition('gallery_cat_id',$m['id']);
			$m['images'] = $chield->getRows();
		}

		$file_content = json_encode($master);
		$fs = \Nette\Utils\FileSystem::write('./websites/'.$this->app->current_website_name.'/www/layout/imagegallery.json',$file_content);
	}

}