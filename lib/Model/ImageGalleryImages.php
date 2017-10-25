<?php

namespace xepan\cms;

/**
* 
*/
class Model_ImageGalleryImages extends \xepan\base\Model_Table{
	public $table = 'xepan_cms_image_gallery_images';
	public $acl ='xepan\cms\Model_ImageGalleryCategory';
	
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
		
		$this->addHook('afterSave',[$this,'updateJsonFile']);
	}

	function updateJsonFile(){
		$form = $this->add('xepan\cms\Model_Custom_Form');
		$form->load($this['custom_form_id'])->updateJsonFile();
	}
}