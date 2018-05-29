<?php
namespace xepan\cms;

class Tool_Testimonial extends \xepan\cms\View_Tool{
	public $options = [
		'testimonial_category'=>1,
		'allow_add'=>false,
		'category_show'=>false,
		'image_show'=>true,
		'tittle_show'=>true,
		'describtion_show'=>true,
		'rating_show'=>true,
		'testimonial_row'=>4
	];

	public $cat_model;
	function init(){
		parent::init();
		
		if($this->owner instanceof \AbstractController){
			$this->add('View')->set('I am Testimonial Tool')->addClass('alert alert-info');
			return;		
		} 
		
		if(!$this->options['testimonial_category']){
			$this->add('View')->set('Please select category first form it\'s options')->addClass('alert alert-danger');
			return;
		}
		if($this->options['category_show']){

		}
		
		// $this->js(true)->_css('jquery.easing.1.3');
		// $this->js(true)->_css('fancybox/jquery.fancybox');
		// $this->app->jquery->addStaticInclude('slidepro/jquery.sliderPro.min');
		// $this->app->jquery->addStaticInclude('fancybox/jquery.fancybox.pack');

		$this->cat_model = $cat_model = $this->add('xepan\cms\Model_TestimonialCategory');
		$cat_model->addCondition('status','Active');
		$cat_model->tryLoad($this->options['testimonial_category']);

		if(!$cat_model->loaded()){
			$this->add('View')->set('Category not found')->addClass('alert alert-danger');
			return;	
		}


		$testimonial_model = $this->add('xepan\cms\Model_Testimonial');
		$testimonial_model->addCondition('status','Aprroved');
		$testimonial_model->addCondition('category_id',$cat_model->id);
		
		$lister = $this->add('CompleteLister',null,null,['view/tool/cms/testimoniallist']);
		$lister->setModel($testimonial_model);
	
		

	}
}