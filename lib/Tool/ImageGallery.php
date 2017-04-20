<?php

namespace xepan\cms;


/**
* 
*/
class Tool_ImageGallery extends \xepan\cms\View_Tool{
	public $options=[
						'show_title'=>true,
						'show_description'=>true,
						'img_gallery_category'=>null
	];
	function init(){
		parent::init();

		if(!$this->options['img_gallery_category']){
			$this->add('View_Info')->set("Please Select Category First And Reload");
			return;
		}

		$image_m = $this->add('xepan\cms\Model_ImageGalleryImages');
		$image_m->addCondition('gallery_cat_id',$this->options['img_gallery_category']);
		// $image_m->setOrder('order','asc');

		$carousel_cl = $this->add('CompleteLister',null,null,['view\tool\Google-image-gallery']);
		$carousel_cl->setModel($image_m);
		

		$carousel_cl->addHook('formatRow',function($l){
			// if($this->count == 1)
			// 	$l->current_row_html['active'] = "active";
			// else
			// 	$l->current_row_html['active'] = "deactive";
			// $this->count++;

			if($this->options['show_title']){
				$l->current_row_html['show_title'] = $l->model['name'];
			}else{
				$l->current_row_html['show_text_wrapper'] = ' ';				
			}
			
			$l->current_row_html['show_title'] = $l->model['name'];

			if($this->options['show_description']){
				$l->current_row_html['show_description'] = $l->model['description'];

			}
		});

	}
		// function rander(){
		// 	parent::rander();
  //           $this->app->js(true)->_library('Grid')->init();
		// }

}