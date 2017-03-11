<?php

namespace xepan\cms;

class page_carousel extends \xepan\base\Page{
	public $title = "Carousel";

	function page_index(){
        $category_m = $this->add('xepan\cms\Model_CarouselCategory');
        $category_c = $this->add('xepan\hr\CRUD',null,null,['grid\carouselcategory']);
        $category_c->setModel($category_m,['name'],['name','status']);

        $category_c->grid->addColumn('expander','Images');
    }

    function page_Images(){        
        $image_m = $this->add('xepan\cms\Model_CarouselImage');
        $image_m->addCondition('carousel_category_id',$_GET['carouselcategory_id']);

        $image_c = $this->add('xepan\hr\CRUD',null,null,['grid\carouselimage']);
        $image_c->setModel($image_m,['file_id','title','text_to_display','alt_text','order','link','carousel_category_id'],['file','title','text_to_display','alt_text','order','link','status']);
    
        $image_c->grid->addHook('formatRow',function($g){
            $g->current_row_html['text_to_display'] = $g->model['text_to_display']; 
        });
    }
}