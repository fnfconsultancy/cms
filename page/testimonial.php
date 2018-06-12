<?php 

namespace xepan\cms;

class page_testimonial extends \xepan\base\Page{
	public $title = "Testimonial";

	function page_index(){
		// parent::init();

		$tab = $this->add('Tabs');
		$tab->addTabURL('./testimonial','Testimonials');
		$tab->addTabURL('./category','Testimonial Category');
			
	}

	function page_testimonial(){
		$model = $this->add('xepan\cms\Model_Testimonial');
		$crud = $this->add('xepan\hr\CRUD');
		if($crud->isEditing()){
			$form = $crud->form;
			$form->add('xepan\base\Controller_FLC')
				->showLables(true)
				->addContentSpot()
				->makePanelCollepsible(true)
				->layout([
						'category_id'=>'Add New Testimonial~c1~6',
						'contact_id'=>'c2~6',
						'name~Title'=>'c3~12',
						'description'=>'c4~6',
						'video_url'=>'c5~6',
						'image_id'=>'c6~6',
						'rating'=>'c7~6',
						'created_at'=>'c8~6',
						'status'=>'c9~6',
						'FormButtons~&nbsp;'=>'c10~6'
					]);

		}
		$crud->setModel($model);
		$crud->grid->addFormatter('image','image');
		$crud->grid->addFormatter('contact_image','image');
		$crud->grid->removeAttachment();
	}

	function page_category(){

		$model = $this->add('xepan\cms\Model_TestimonialCategory');
		$crud = $this->add('xepan\hr\CRUD');
		$crud->setModel($model);
		$crud->grid->removeAttachment();

	}
}

	