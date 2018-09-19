<?php
namespace xepan\cms;

class Tool_Testimonial extends \xepan\cms\View_Tool{
	public $options = [
		'testimonial_category'=>0,
		'show_category_name'=>false,
		'show_image'=>true,
		'show_title'=>true,
		'show_description'=>true,
		'show_rating'=>true,
		'margin_between_slide'=>10,
		'loop'=>false,
		'display_items'=>2,
		'startPosition'=>1,
		'nav'=>true,
		'slideBy'=>2,
		'autoplay'=>true,
		'layout'=>'testimonialhorizontal',
		'custom_template'=>null
	];

	public $cat_model;
	public $lister;

	function init(){
		parent::init();
		// $this->js(true)->_css('../owlslider/assets/owl.carousel');
		$this->js(true)->_css('../owlslider/assets/owl.theme.default');
		$this->js()->_load('../owlslider/owl.carousel.min');

		if($this->owner instanceof \AbstractController){
			$this->add('View')->set('please select testimonial options, by double clicking on it')->addClass('alert alert-info');
			return;		
		} 
		
		if(!$this->options['testimonial_category']){
		$this->add('View')->set('Please select category form it\'s options')->addClass('alert alert-danger');
			return;
		}
		
		$this->cat_model = $cat_model = $this->add('xepan\cms\Model_TestimonialCategory');
		$cat_model->addCondition('status','Active');
		$cat_model->tryLoad($this->options['testimonial_category']);

		if(!$cat_model->loaded()){
			$this->add('View')->set('Category not found')->addClass('alert alert-danger');
			return;	
		}

		$testimonial_model = $this->add('xepan\cms\Model_Testimonial');
		$testimonial_model->addCondition('status','Approved');
		$testimonial_model->addCondition('category_id',$cat_model->id);
		
		$layout = $this->options['layout'];
		if($this->options['custom_template']){
			$layout = $this->options['custom_template'];
			$path = getcwd()."/websites/".$this->app->current_website_name."/www/view/tool/testimonial/".$layout.".html";
			if(!file_exists($path)){
				$this->add('View_Warning')->set('your define template('.$layout.') not found at location /www/view/tool/testimonial/'.$layout.'.html');
				$layout = $this->options['layout'];
				return;
			}
		}
		
		$this->lister = $lister = $this->add('CompleteLister',null,null,['view/tool/cms/testimonial/'.$layout]);
		$lister->setModel($testimonial_model);
		$lister->add('xepan\cms\Controller_Tool_Optionhelper',['options'=>$this->options,'model'=>$testimonial_model]);
		
		$this->lister->template->trySet('display_items',$this->options['display_items']);
	}
	
	function addToolCondition_row_show_title($value,$l){
		if(!$value) $l->template->tryDel('name_wrapper');
	}

	function addToolCondition_row_show_category_name($value,$l){
		if(!$value){
			$l->template->tryDel('category_wrapper');
			$l->template->tryDel('category');
		} 
	}

	function addToolCondition_row_show_description($value,$l){
		if(!$value) $l->template->tryDel('description_wrapper');
	}

	function addToolCondition_row_show_image($value,$l){
		if(!$value) $l->template->tryDel('image_wrapper');
	}

	function addToolCondition_row_show_rating($value,$l){
		if(!$value){
			$l->template->tryDel('rating_wrapper');
			return;
		}

		$form = $l->add('Form',['name' => "rating_view_".$l->model->id],'rating');
		$rating_field = $form->addField('xepan\base\Rating','rating','')
			->setValueList(['1'=>'1','2'=>'2','3'=>'3','4'=>'4','5'=>'5'])->set($l->model['rating']);
		$rating_field->initialRating = $l->model['rating'];
		$rating_field->readonly = true;
		$l->current_row_html['rating'] = $form->getHtml();
	}

	function render(){

		$owl_options = [
				'items'=>1,
				'loop'=>false,
				'items'=>$this->options['display_items'],
				'margin'=>$this->options['margin_between_slide'],
				'loop'=>$this->options['loop'],
				'startPosition'=>$this->options['startPosition'],
				'nav'=>$this->options['nav'],
				'slideBy'=>$this->options['slideBy'],
				'autoplay'=>true,
				'lazyLoad'=>true,
				'responsiveClass'=>true,
				'responsive'=>[
						10=>['items'=>1],
						1000=>['items'=>1]
					]
			];
		// $this->js()->_selector('.slider-wrapper-'.$this->lister->name)->owlCarousel($owlopt);
		parent::render();
	}
}