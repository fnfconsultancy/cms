<?php

namespace xepan\cms;

class page_admin_getforms extends \Page{
	function init(){
		parent::init();

		$cf = $this->add('xepan\cms\Model_Custom_Form');
		$rows = $cf->getRows(['id','name']);
		$option="";
		foreach ($rows as $row) {
			$option .= "<option value='".$row['id']."'>".$row['name']."</option>";
		}

		echo $option;
		exit;
	}
}