<?php
namespace xepan\cms;

class View_Tool extends \View{

	public $options=[];
	public $option_panel_options=
		[
			'Basic' => ['a','b'=>'c','d'=>['e','f']],
			'Panel'
		];

	function setModel($model,$fields=null){
		$m = parent::setModel($model,$fields);
		$this->add('xepan\base\Controller_Tool_Optionhelper');
		return $m;
	}

	function render(){
		if($this->app->isEditing){
			$this->js(true)
				->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanComponent.js')
				->xepanComponent($this->option_panel_options);
		}
		parent::render();
	}
}