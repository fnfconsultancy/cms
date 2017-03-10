<?php

namespace xepan\cms;

class Model_CarouselCategory extends \xepan\base\Model_Table{
	public $table = 'carouselcategory';
	public $status = ['Active','InActive'];
	public $actions = [
					'Active'=>['view','edit','delete','deactivate'],
					'InActive'=>['view','edit','delete','activate']
					];

	function init(){
		parent::init();
		
		$this->hasOne('xepan\hr\Employee','created_by_id')->defaultValue($this->app->employee->id);

		$this->addField('name');
		$this->addField('status')->enum(['Active','InActive'])->defaultValue('Active');
		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);

		$this->addField('type');
		$this->addCondition('type','CarouselCategory');

		$this->hasMany('xepan\cms\CarouselImage','carousel_image_id');
	}

	function activate(){
		$this['status']='Active';
		$this->app->employee
            ->addActivity("Carousel Category : '".$this['name']."' Activated", null/* Related Document ID*/, $this->id /*Related Contact ID*/,null,null,null)
            ->notifyWhoCan('deactivate','Active',$this);
		$this->save();
	}

	function deactivate(){
		$this['status']='InActive';
		$this->app->employee
            ->addActivity("Carousel Category : '".$this['name']."' is deactivated", null/* Related Document ID*/, $this->id /*Related Contact ID*/,null,null,null)
            ->notifyWhoCan('activate','InActive',$this);
		$this->save();
	}
}