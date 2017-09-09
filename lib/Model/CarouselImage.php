<?php

namespace xepan\cms;

class Model_CarouselImage extends \xepan\base\Model_Table{
	public $table = "carouselimage";
	public $status=[
		'Visible',
		'Hidden'
	];

	public $actions=[
		'Visible'=>['view','edit','delete','hide'],
		'Hidden'=>['view','edit','delete','show']
	];

	function init(){
		parent::init();
		 
		$this->hasOne('xepan\cms\Model_CarouselCategory','carousel_category_id');
		$this->hasOne('xepan\hr\Model_Employee','created_by_id')->defaultValue(@$this->app->employee->id);
		
		$this->add('xepan\filestore\Field_File','file_id');
		
		$this->addField('title');
		$this->addField('text_to_display')->display(['form'=>'xepan\base\RichText']);
		$this->addField('alt_text');
		$this->addField('order');
		$this->addField('link');

		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);
		$this->addField('status')->enum($this->status)->defaultValue('Visible');
		
		$this->addField('type');
		$this->addCondition('type','CarouselImage');
					
		$this->addExpression('thumb_url')->set(function($m,$q){
			return $q->expr('[0]',[$m->getElement('file')]);
		});
	}

	function show(){
		$this['status']='Visible';
		$this->app->employee
            ->addActivity("Carousel Image : '".$this['title']."' is now visible", null/* Related Document ID*/, $this->id /*Related Contact ID*/,null,null,null)
            ->notifyWhoCan('hide','Visible',$this);
		$this->save();
	}

	function hide(){
		$this['status']='Hidden';
		$this->app->employee
            ->addActivity("Carousel Image : '".$this['title']."' is now hidden", null/* Related Document ID*/, $this->id /*Related Contact ID*/,null,null,null)
            ->notifyWhoCan('hide','Hidden',$this);
		$this->save();
	}
}