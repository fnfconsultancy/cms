<?php

namespace xepan\cms;

class Model_CarouselImage extends \xepan\base\Model_Table{
	public $table = "carouselimage";
	public $status=[
		'Visible',
		'Hidden'
	];

	public $actions=[
		'Visible'=>['view','layers','edit','delete','hide'],
		'Hidden'=>['view','edit','delete','show']
	];

	function init(){
		parent::init();
		 
		$this->hasOne('xepan\cms\Model_CarouselCategory','carousel_category_id');
		$this->hasOne('xepan\hr\Model_Employee','created_by_id')->defaultValue(@$this->app->employee->id);
		
		$this->addField('file_id')->display(['form'=>'xepan\base\ElImage']);
		
		$this->addField('title');
		$this->addField('text_to_display')->display(['form'=>'xepan\base\RichText']);
		$this->addField('alt_text');
		$this->addField('order');
		$this->addField('link');

		$this->addField('slide_type')->enum(['Image','Video']);

		$this->addField('created_at')->type('datetime')->defaultValue($this->app->now);
		$this->addField('status')->enum($this->status)->defaultValue('Visible');
		
		$this->addField('type');
		$this->addCondition('type','CarouselImage');

		// $this->addExpression('thumb_url')->set(function($m,$q){
		// 	return $q->expr('[0]',[$m->getElement('file')]);
		// });

		$this->addHook('afterSave',[$this,'updateJsonFile']);
		$this->add('dynamic_model/Controller_AutoCreator');
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

	function updateJsonFile(){

		// if(!$this->app->epan['is_template']) return;
		
		if(isset($this->app->skipDefaultTemplateJsonUpdate) && $this->app->skipDefaultTemplateJsonUpdate) return;
		
		$master = $this->add('xepan\cms\Model_CarouselCategory');
		$master->load($this['carousel_category_id'])->updateJsonFile();
	}


	function page_layers($page){

		$img = $page->add('xepan\cms\Model_CarouselLayer');
		$img->addCondition('carousel_image_id',$this->id);
		$crud = $page->add('xepan\base\CRUD');
		$crud->setModel($img);
	}

}