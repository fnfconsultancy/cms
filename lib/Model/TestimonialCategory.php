<?php 

namespace xepan\cms;

class Model_TestimonialCategory extends \xepan\base\Model_Table{
	public $table = "testimonialCategory";
	public $status = ['Active','InActive'];
	public $actions = [
					'Active'=>['view','edit','delete','testimonial','deactivate'],
					'InActive'=>['view','edit','delete','activate']
				];
	public $acl_type = "xepan_testimonial_category";

	function init(){
		parent::init();

		$this->hasOne('xepan\base\contact','created_by_id')->system(true)->defaultValue(@$this->app->employee->id);
		
		$this->addField('name');
		$this->addField('status')->enum($this->status)->defaultValue('Active');

		// $this->add('dynamic_model\Controller_AutoCreator');
		
		$this->hasMany('xepan\cms\Testimonial','category_id');
		$this->is(
			[
				'name|to_trim|required',
				'status|to_trim|required',
			]
		);

	}

	function deactivate(){
		$this['status'] = "InActive";
		$this->save();
	}

	function activate(){
		$this['status'] = "Active";
		$this->save();
	}

	function page_testimonial($page){
		$model = $this->add('xepan\cms\Model_Testimonial');
		$model->addCondition('category_id',$this->id);
		$crud = $page->add('xepan\hr\CRUD');

		$page = $crud->form;
		$page->add('xepan\base\Controller_FLC')
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

		$crud->setmodel($model);
		$crud->grid->addFormatter('image','image');
		$crud->grid->addFormatter('contact_image','image');
		$crud->grid->removeAttachment();
		$crud->grid->addPaginator(5);
		$crud->grid->removeColumn('created_by');
		$q_f = $crud->grid->addQuickSearch(['contact','name','description']);
		$status_f = $q_f->addField('DropDown','t_status')->setValueList(['0'=>'All Status','Pending'=>'Pending','Approved'=>'Approved','Cancelled'=>'Cancelled']);


		$q_f->addHook('applyFilter',function($f,$m){
			if($f['t_status']){
				$m->addCondition('status',$f['t_status']);
			}
		});
		$status_f->js('change',$q_f->js()->submit());
	}

		


}