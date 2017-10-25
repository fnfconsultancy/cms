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
		
		$this->hasOne('xepan\hr\Employee','created_by_id')->defaultValue(@$this->app->employee->id);

		$this->addField('name');
		$this->addField('status')->enum(['Active','InActive'])->defaultValue('Active');
		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);

		$this->addField('type');
		$this->addCondition('type','CarouselCategory');

		$this->hasMany('xepan\cms\CarouselImage','carousel_image_id');
		
		$this->addHook('afterSave',[$this,'updateJsonFile']);
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

	function updateJsonFile(){
		$path = $this->api->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name."/www/layout";
		if(!file_exists(realpath($path))){
			\Nette\Utils\FileSystem::createDir('./websites/'.$this->app->current_website_name.'/www/layout');
		}

		$cats = $this->add('xepan\cms\Model_CarouselCategory')->getRows();
		foreach ($cats as &$cat) {
			$images = $this->add('xepan\cms\Model_CarouselImage');
			$images->addCondition('carousel_category_id',$cat['id']);
			$cats['images'] = $images->getRows();
		}

		$file_content = json_encode($cats);
		$fs = \Nette\Utils\FileSystem::write('./websites/'.$this->app->current_website_name.'/www/layout/carousel.json',$file_content);
	}
}