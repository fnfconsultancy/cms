<?php

namespace xepan\cms;

/**
* 
*/
class Tool_BootStrapMenu extends \xepan\cms\View_Tool{
	public $options=[
						'show_brand'=>true,
						'#nav-position'=>'relative'
	];
	function init(){
		parent::init();

	}
	
	function defaultTemplate(){
		return ['xepan/tool/bootstrap-menu'];
	}
}