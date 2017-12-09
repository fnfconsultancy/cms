<?php

namespace xepan\cms;
/**
* display all category and image can be used in portfoli or image gallery 
*/
class Tool_Gallery extends \xepan\cms\View_Tool{
	public $options=[];

	function init(){
		parent::init();

		if($this->owner instanceof \AbstractController) return;

		$this->js(true)->_css('gallery');

		$cat = $this->add('xepan\cms\Model_ImageGalleryCategory');
		$cat->addCondition('status','Active');

		$lister = $this->add('Lister',null,'category',['xepan\tool\gallery','category_list']);
		$lister->setModel($cat);

		$images = $this->add('xepan\cms\Model_ImageGalleryImages');
		$images->addExpression('cat_status')->set(function($m,$q){
			return $q->expr('[0]',[$m->refSQL('gallery_cat_id')->fieldQuery('status')]);
		});
		// $images->addExpression('image_path')->set(function($m,$q){
		// 	return './websites/'.$this->app->current_website_name."/".$m['image_id'];
		// });

		$images->addCondition('cat_status','Active');

		$img_lister = $this->add('Lister',null,'item_list',['xepan\tool\gallery','item']);
		$img_lister->setModel($images);

		$img_lister->addHook('formatRow',function($g){
			$g->current_row['image_path'] = './websites/'.$this->app->current_website_name."/".$g->model['image_id'];
		});
		
	}


	function render(){
		$this->app->jquery->addStaticInclude('jquery.mixitup.min');

		parent::render();
	}

	function defaultTemplate(){
		return ['xepan\tool\gallery'];
	}
	
}