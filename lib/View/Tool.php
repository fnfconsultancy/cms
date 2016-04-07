<?php
namespace xepan\cms;

class View_Tool extends \View{

	public $options=[];

	public $virtual_page=null;
	public $add_option_helper = true;

	public $option_panel_options=
		[
			'Text' => [
				'Block Title 1' =>[
					'Field Title' => [
						'type'=>'DropDown',
						'values'=>'',
						'effect on'=>'parent,self,selector'
					]
				]
			],
			'Background'=>[
				'Color'=>[
					'type'=>'color',
					'style'=>'color:{arg1};'
				],
				'Image'=>[
					'type'=>'image',
					'style'=>'bacground:url({arg1});'

				]
			],
			'Margin'=>[
				'effect_all'=> true,
				[
					'Top'=>[
						['type'=>'slider|0|100'],
						['type'=>'DropDown','values'=>['px','%']],
						'style'=>'margin-top:{arg1}{arg2};'
					]

				]
			],
			'Padding'
		];

	function initializeTemplate($template_spot = null, $template_branch = null){
		$this->options = $this->_options + $this->options;
		parent::initializeTemplate($template_spot, $template_branch);
	}

	function init(){
		parent::init();
		$this->option_page = $this->option_panel_page = $this->add('VirtualPage');
	}

	function setModel($model,$fields=null){
		$m = parent::setModel($model,$fields);
		if($this->add_option_helper)
			$this->add('xepan\cms\Controller_Tool_Optionhelper');
		return $m;
	}

	function render(){
		if(@$this->app->isEditing){
			$this->js(true)
				->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanComponent.js')
				->xepanComponent(array_merge($this->option_panel_options, ['option_page_url'=>$this->option_panel_page->getURL()]));
		}
		parent::render();
	}
}