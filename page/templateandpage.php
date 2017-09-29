<?php

namespace xepan\cms;

class page_templateandpage extends \xepan\base\Page{
	public $title = "Templates and Pages";

	function init(){
		parent::init();

		$tab = $this->add('Tabs');
		$temp_tab = $tab->addTab('Template');
		$page_tab = $tab->addTab('Page');

		$crud = $temp_tab->add('xepan\hr\CRUD');
		$crud->setModel('xepan\cms\Template',['name','path','is_active']);
		$crud->grid->removeColumn('action');
		$crud->grid->removeColumn('attachment_icon');
		/*Start Live Edit Template */
		$crud->grid->addColumn('Button','live_edit_template');
		$crud->grid->addMethod('format_live_edit_template',function($g,$f){
			$url =$this->app->url('layout/'.$g->model['name'],['xepan-template-edit'=>"layout/".$g->model['name']]);	
			$url = str_replace('/admin/',"/",$url);
			$g->current_row_html['live_edit_template']= '<a href="javascript:void(0)" onclick="'.$g->js()->univ()->newWindow($url).'"><span class="btn btn-success">Live Edit</span></a>';
		});
		$crud->grid->addFormatter('live_edit_template','live_edit_template');
		/*END Live Edit Template */

		$crud = $page_tab->add('xepan\hr\CRUD');
		$crud->setModel('xepan\cms\Page');
		$crud->grid->removeColumn('action');
		$crud->grid->removeColumn('attachment_icon');


		if($crud->isEditing()){
			$form =$crud->form;
			$form->getElement('parent_page_id')->getModel()->addCondition('is_template',false);
		}

		/*Start Live Edit page */
		$crud->grid->addColumn('Button','live_edit_page');
		$crud->grid->addMethod('format_live_edit_page',function($g,$f){
			$url =$this->app->url($g->model['path']);	
			$url = str_replace('/admin/',"/",$url);
			$url = str_replace('.html',"",$url);
			$g->current_row_html['live_edit_page']= '<a href="javascript:void(0)" onclick="'.$g->js()->univ()->newWindow($url).'"><span class="btn btn-success">Live Edit</span></a>';
		});
		$crud->grid->addFormatter('live_edit_page','live_edit_page');
		/*END Live Edit Page */
	}
}