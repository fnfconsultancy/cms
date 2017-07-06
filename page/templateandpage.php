<?php

namespace xepan\cms;

class page_templateandpage extends \xepan\base\Page{
	public $title = "Templates and Pages";

	function init(){
		parent::init();

		$tab = $this->add('Tabs');
		$temp_tab = $tab->addTab('Template');
		$page_tab = $tab->addTab('Page');

		$crud = $temp_tab->add('xepan\base\CRUD');
		$crud->setModel('xepan\cms\Template',['name','path','is_active']);
		$crud->grid->removeColumn('action');
		$crud->grid->removeColumn('attachment_icon');

		$crud = $page_tab->add('xepan\hr\CRUD');
		$crud->setModel('xepan\cms\Page');
		$crud->grid->removeColumn('action');
		$crud->grid->removeColumn('attachment_icon');
		if($crud->isEditing()){
			$form =$crud->form;
			$form->getElement('parent_page_id')->getModel()->addCondition('is_template',false);
		}

	}
}