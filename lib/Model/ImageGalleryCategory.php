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

	}
}