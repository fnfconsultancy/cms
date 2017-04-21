<?php


namespace xepan\cms;

/**
* 
*/
class page_gallery extends \xepan\base\Page{
	public $title = "Image Gallery";
	function page_index(){
        $gallery = $this->add('xepan\cms\Model_ImageGalleryCategory');
		$c = $this->add('xepan\hr\CRUD',null,null,['grid/imagegallery']);

		$c->setModel($gallery,['name'],['name','status']);

		$c->grid->addColumn('expander','Images');
    }

    function page_Images(){        
        $category_id = $this->app->stickyGET('xepan_cms_image_gallery_categories_id');
        
        $image_m = $this->add('xepan\cms\Model_ImageGalleryImages');
        $image_m->addCondition('gallery_cat_id',$category_id);

        $image_c = $this->add('xepan\hr\CRUD',null,null,['grid\imagegallery-images']);
        $image_c->setModel($image_m,['image_id','name','description','gallery_cat_id'],['image','name','status','description']);
    
    }
}