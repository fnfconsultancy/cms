<?php

namespace xepan\cms;

class page_getpage extends \Page{

	function init(){
		parent::init();

		$pages = [];
		$root_page = $this->add('xepan\cms\Model_Page');
		$root_page->addCondition($root_page->_dsql()->orExpr()->where('parent_page_id',0)->where('parent_page_id',null))
				->addCondition('is_active',true)
				->addCondition('is_muted',false)
				;

		foreach ($root_page as $parent_page) {
			$pages["".str_replace(".html", "", $parent_page['path'])] = [
									'name'=>$parent_page['name'],
									// 'template_path'=>$parent_page['template_path'],
									'subpage'=>$this->getPages($parent_page)
								];
		}

		// echo "<pre>";
		// print_r($pages);
		// echo "</pre>";
		echo json_encode($pages);
		exit;		
	}

	function getPages($parent_page){

		$output = [];
		if($parent_page->ref('SubPages')->count()->getOne() > 0){
			
			$sub_pages = $parent_page->ref('SubPages')
							->addCondition('is_active',true)
							->addCondition('is_muted',false)
							;
			foreach ($sub_pages as $junk_page) {
				$output["".str_replace(".html", "", $junk_page['path'])] = [
										'name'=>$junk_page['name'],
										// 'template_path'=>$junk_page['template_path'],
										'subpage'=>$this->getPages($junk_page)
									];
			}

		}

		return $output;
	}

}