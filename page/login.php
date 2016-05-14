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


class page_login extends \Page {
	public $title='Login page For CMS Editors';

	function init(){
		parent::init();

		$user = $this->add('xepan\base\Model_User');
		
        $auth = $this->app->auth;
        $auth->setModel($user,'username','password');

        $auth->check();

	}
}
