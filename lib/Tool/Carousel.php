<?php

namespace xepan\cms;

class Tool_Carousel extends \xepan\cms\View_Tool{
	public $count = 1;
	public $options = [
				'show_text'=>true,
				'category'=>null
			];

	function init(){
		parent::init();

		if(!$this->options['category'])
			return;

		$image_m = $this->add('xepan\cms\Model_CarouselImage');
		$image_m->addCondition('carousel_category_id',$this->options['category']);
		$image_m->setOrder('order','asc');

		$carousel_cl = $this->add('CompleteLister',null,null,['view\tool\cmscarousel']);
		$carousel_cl->setModel($image_m);	
		
		$carousel_cl->addHook('formatRow',function($l){
			if($this->count == 1)
				$l->current_row_html['active'] = "active";
			else
				$l->current_row_html['active'] = "deactive";
			$this->count++;

			if($this->options['show_text'] ==false){
				$l->current_row_html['show_text_wrapper'] = ' ';
			}else{
				$l->current_row_html['show_text'] = $l->model['text_to_display'];
			}
		});
	}
}