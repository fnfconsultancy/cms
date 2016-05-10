<?php

/**
* description: ATK Page
* 
* @author : Gowrav Vishwakarma
* @email : gowravvishwakarma@gmail.com, info@xavoc.com
* @website : http://xepan.org
* 
*/

namespace xepan\cms;

class page_admin_save_page extends \Page {

	function init(){
		parent::init();
		
		echo 'console.log('.var_dump($_POST).')';
		echo $this->js(true)->_selectorDocument()->univ()->successMessage("hello");
		exit;
	}
}
