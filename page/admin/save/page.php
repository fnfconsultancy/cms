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
		
		file_put_contents($_POST['file_path'], urldecode( trim( $_POST['body_html'] ) ));

		echo $this->js(true)->_selectorDocument()->univ()->successMessage("hello");
		exit;
	}
}
