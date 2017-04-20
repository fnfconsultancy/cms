<?php

namespace xepan\cms;

/**
* 
*/
class Model_ImageGalleryImages extends \xepan\base\Model_Table{
	public $table = 'xepan_cms_image_gallery_images';
	function init(){
		parent::init();
		$this->hasOne('xepan\hr\Model_Employee','created_by_id')->defaultValue($this->app->employee->id);
		$this->hasOne('xepan\cms\ImageGalleryCategory','gallery_cat_id');
		
		$this->addField('name')->caption('Title');
		$this->add('xepan/filestore/Field_Image',['name'=>'image_id']);
		
		$this->addField('status')->enum(['Active','InActive'])->defaultValue('Active');
		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);
		
		$this->addField('type');
		$this->addCondition('type','ImageGallery');
		
		$this->addField('description')->type('text')->display(['xepan\base\RichText']);

		$this->addExpression('thumb_url')->set(function($m,$q){
			return $q->expr('[0]',[$m->getElement('image')]);
		});
	}
}