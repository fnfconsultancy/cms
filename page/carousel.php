<?php

namespace xepan\cms;

class page_carousel extends \xepan\base\Page{
	public $title = "Carousel";

	function init(){
	    parent::init();

    	$tabs = $this->add('Tabs');
        $category = $tabs->addTab('Carousel Category');
        $image = $tabs->addTab('Carousel Image');

        $category_m = $category->add('xepan\cms\Model_CarouselCategory');
        $category_c = $category->add('xepan\hr\CRUD',null,null,['grid\carouselcategory']);
        $category_c->setModel($category_m,['name'],['name','status']);

        $image_m = $image->add('xepan\cms\Model_CarouselImage');
        $image_c = $image->add('xepan\hr\CRUD',null,null,['grid\carouselimage']);
        $image_c->setModel($image_m,['title','text_to_display','alt_text','order','link','carousel_category_id','file_id'],['title','text_to_display','alt_text','order','link','status','file']);
    }
}