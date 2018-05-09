<?php 

namespace xepan\cms;

class Model_TestimonialCategory extends \xepan\base\Model_Table{
	public $table = "testimonialCategory";
	public $status = ['Active','InActive'];
	public $actions = [
					'Active'=>['view','edit','delete','testimonial','deactivate'],
					'InActive'=>['view','edit','delete','activate']
				];

	function init(){
		parent::init();

		$this->addField('name');
		$this->addField('status')->enum($this->status)->defaultValue('Active');

		$this->add('dynamic_model\Controller_AutoCreator');
		
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

	


}