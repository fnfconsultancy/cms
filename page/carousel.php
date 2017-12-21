<?php

namespace xepan\cms;

class page_carousel extends \xepan\base\Page{
	public $title = "Carousel";

	function init(){
        parent::init();
                    
        $category_m = $this->add('xepan\cms\Model_CarouselCategory');
        $category_c = $this->add('xepan\hr\CRUD');
        
        $category_c->setModel($category_m);
        $category_c->removeAttachment();
        $category_c->grid->addPaginator($ipp=30);
        $category_c->grid->addQuickSearch(['name']);
    }
}