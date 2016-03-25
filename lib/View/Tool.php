<?php
namespace xepan\cms;

class View_Tool extends \View{

	public $options=[];
	// public $option_panel_options=
	// 	[
	// 		'Text' => [
	// 			'Block Title 1' =>[
	// 				'Field Title' => [
	// 					'type'=>'DropDown',
	// 					'values'=>'',
	// 					'effect on'=>'parent,self,selector'
	// 				]
	// 			]
	// 		],
	// 		'Background'=>[
	// 			'Color'=>[
	// 				'type'=>'color',
	// 				'style'=>'color:{arg1};'
	// 			],
	// 			'Image'=>[
	// 				'type'=>'image',
	// 				'style'=>'bacground:url({arg1});'

	// 			]
	// 		],
	// 		'Margin'=>[
	// 			'effect_all': true
	// 			[
	// 				'Top'=>[
	// 					['type'=>'slider|0|100']['type'=>'DropDown','values'=>['px','%']],
	// 					'style'=>'margin-top:{arg1}{arg2};'
	// 				]

	// 			]
	// 		],
	// 		'Padding'
	// 	];

	function init(){
		parent::init();
		$this->options = $this->options + $this->_options;
	}

	function setModel($model,$fields=null){
		$m = parent::setModel($model,$fields);
		$this->add('xepan\cms\Controller_Tool_Optionhelper');
		return $m;
	}

	function render(){
		if(@$this->app->isEditing){
			$this->js(true)
				->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanComponent.js')
				->xepanComponent($this->option_panel_options);
		}
		parent::render();
	}
}