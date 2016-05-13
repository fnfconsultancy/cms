<?php


namespace xepan\cms;


class Tool_Columns extends \xepan\cms\View_Tool {
	
	public $runatServer = false;

	function init(){
		parent::init();

		$this->add('View')->setHTML("HOO<b>OO</b>Ohaaa");
	}
	
}