<?php

namespace xepan\cms;

class page_websites extends \xepan\base\Page{
	public $title = "Website";
	function init(){
		parent::init();

		// as per page 
		// http://codepen.io/kaizoku-kuma/pen/JDxtC

		$this->js(true,'

			$("#'.$this->name.'").elfinder({
				url: "index.php?page=xepan_base_adminelconnector"
			});

		');
	}
}