<?php

namespace xepan\cms;

class page_customform extends \Page {
	public $title='Custom Form';

	function init(){
		parent::init();
		
		$model_cust_form = $this->add('xepan\cms\Model_Custom_Form');
		$crud=$this->add('xepan\hr\CRUD',null,
						null,
						['view/cust_form/grid']
					);

		$crud->setModel($model_cust_form);
		// if($crud->isEditing()){
		// 	$crud->form->setLayout('view/cust_form/form/cust_form');
		// }
		
		$crud->grid->add('VirtualPage')
			->addColumn('Fields')
			->set(function($page){
				$form_id = $_GET[$page->short_name.'_id'];

				$field_model = $page->add('xepan\cms\Model_Custom_FormField')->addCondition('custom_form_id',$form_id);

				$crud_field = $page->add('xepan\hr\CRUD');
				$crud_field->setModel($field_model);

		});

	}
}
