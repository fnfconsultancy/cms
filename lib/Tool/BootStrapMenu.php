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

		if($this->options['show_brand']==false){
			$this->template->tryDel('navbar_brand');
		}

		// if($this->options['nav-position']=="fixed"){
		// 	$this->addClass('navbar-fixed-top');
		// }
	}
	
	function defaultTemplate(){
		return ['xepan/tool/bootstrap-menu'];
	}
}