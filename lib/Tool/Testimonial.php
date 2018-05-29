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
		'items'=>3,
		'margin_between_slide'=>10,
		'loop'=>true,
		'startPosition'=>1,
		'nav'=>true,
		'slideBy'=>1,
		'autoplay'=>false
	];

	public $cat_model;
	public $lister;

	function init(){
		parent::init();
		
		$this->js(true)->_css('../owlslider/assets/owl.carousel');
		$this->js(true)->_css('../owlslider/assets/owl.theme.default');
		$this->js()->_load('../owlslider/owl.carousel.min');

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
		
		$this->lister = $lister = $this->add('CompleteLister',null,null,['view/tool/cms/testimoniallist']);
		$lister->setModel($testimonial_model);
		
	}

	function render(){
		$owl_options = [
				'items'=>$this->options['items'],
				'margin'=>$this->options['margin_between_slide'],
				'loop'=>$this->options['loop'],
				'startPosition'=>$this->options['startPosition'],
				'nav'=>$this->options['nav'],
				'slideBy'=>$this->options['slideBy'],
				'autoplay'=>$this->options['autoplay'],
				'lazyLoad'=>true,
				'responsiveClass'=>true,
				'responsive'=>[
					        0=>[
					            'items'=>1,
					            'nav'=>true
					        ],
					        600=>[
					            'items'=>3,
					            'nav'=>true
					        ],
					        1000=>[
					            'items'=>5,
					            'nav'=>true,
					            'loop'=>false
					        ]
					    ],
			];

		$this->js(true)->_selector('.owl-carousel')->owlCarousel($owl_options);
		parent::render();
	}
}