<?php

namespace xepan\cms;

class page_customform extends \xepan\base\Page {
	public $title='Custom Form';

	function init(){
		parent::init();
		$model_cust_form = $this->add('xepan\cms\Model_Custom_Form');

		$model_cust_form->addExpression('total_enquiry')->set(function($m,$q){
			return $this->add('xepan\cms\Model_Custom_FormSubmission')
					    ->addCondition('custom_form_id',$m->getElement('id'))
					    ->count();
		});

		$crud = $this->add('xepan\hr\CRUD',null,null,['view/cust-form/grid']);

		if($crud->isEditing()){
			$form = $crud->form;
			$categories_field = $form->addField('DropDown','category');
			$categories_field->setModel($this->add('xepan\marketing\Model_MarketingCategory'));
			$categories_field->addClass('multiselect-full-width');
			$categories_field->setAttr(['multiple'=>'multiple']);
			$categories_field->setEmptyText("Please Select");

		}

		$crud->setModel($model_cust_form,['emailsetting_id','name','submit_button_name','form_layout','custom_form_layout_path','total_enquiry','recieve_email','recipient_email','auto_reply','email_subject','message_body','created_at','created_by_id','type','status','is_create_lead','is_associate_lead','lead_category_ids']);

		if($crud->isEditing()){
			$form = $crud->form;
			$cat_field = $form->getElement('category');

			if($form->isSubmitted()){
				$category_names = $form['category'];

				if(is_array($form['category'])){
					throw new \Exception("Error Processing Request", 1);
					$category_names = implode(",", $form['category']);
				}

				$form->model['lead_category_ids'] = $category_names;
				$form->model->save();
			}

			if($form->model['lead_category_ids'] != null)
				$cat_field->set( explode(",", $form->model['lead_category_ids']))->js(true)->trigger('changed');
		}

		$crud->grid->add('VirtualPage')
			->addColumn('Fields')
			->set(function($page){
				$form_id = $_GET[$page->short_name.'_id'];

				$field_model = $page->add('xepan\cms\Model_Custom_FormField')->addCondition('custom_form_id',$form_id);

				$crud_field = $page->add('xepan\hr\CRUD');
				$crud_field->setModel($field_model);
				$crud_field->grid->addQuickSearch(['name']);

				if($crud_field->isEditing()){
					$type_field = $crud_field->form->getElement('type');
					$type_field->js(true)->univ()->bindConditionalShow([
						'email'=>['auto_reply']
					],'div.atk-form-row');

				}
		});
		$crud->grid->addQuickSearch(['name']);
	}
}
