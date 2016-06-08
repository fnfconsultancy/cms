<?php

namespace xepan\cms;

class Page_cmseditors extends \xepan\base\Page{
	public $title = "CMS Editors";
	function init(){
		parent::init();

		$cmseditors = $this->add('xepan\base\CRUD');
		$cmseditors->setModel('xepan\cms\Model_User_CMSEditor',['username','can_edit_template','can_edit_page_content']);
	}
}