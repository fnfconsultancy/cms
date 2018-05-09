<?php
namespace xepan\cms;

class Tool_Testimonial extends \xepan\cms\View_Tool{
	public $options = [
		'testimonial_category'=>0,
		'allow_add'=>false,
		'allow_edit'=>false,

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
		

		$this->cat_model = $cat_model = $this->add('xepan\cms\Model_TestimonialCategory');
		$cat_model->addCondition('status','Active');
		$cat_model->tryLoad($this->options['testimonial_category']);

		if(!$cat_model->loaded()){
			$this->add('View')->set('Category not found')->addClass('alert alert-danger');
			return;	
		}


		$testimonia_model = $this->add('xepan\cms\Model_Testimonial');
		$testimonia_model->addCondition('status','Aprroved');
		$testimonia_model->addCondition('category_id',$cat_model->id);

		$crud = $this->add('CRUD');
		$crud->setModel($testimonia_model);


	}
}