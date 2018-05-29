<?php 

namespace xepan\cms;

class Model_Testimonial extends \xepan\base\Model_Table{
	public $table = "testimonial";
	public $rating_list = ['1','1.5','2','2.5','3','3.5','4','4.5','5'];
	public $acl_type = "xepan_testimonial";
	function init(){
		parent::init();
		
		$this->hasOne('xepan\cms\Model_TestimonialCategory','category_id'); 
		$this->hasOne('xepan\base\contact','contact_id');

        $this->addField('name')->caption('Title');
		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);
        $this->add('xepan\filestore\Field_File','image_id');
		$this->addField('description')->type('text');
		$this->addField('status')->enum(['Pending','Aprroved','Cancelled']);
		$this->addField('video_url')->type('text');
		$this->addField('rating')->enum($this->rating_list);

		$this->addExpression('contact_image')->set($this->refSQL('contact_id')->fieldQuery('image'));
		$this->add('dynamic_model\Controller_AutoCreator');

	}


}