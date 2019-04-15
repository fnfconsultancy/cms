<?php

namespace xepan\cms;

class Page_cmscontact extends \xepan\base\Page{
	public $title = "CMS Contacts";
	function init(){
		parent::init();

		$tab = $this->add('Tabs');
		$contact = $tab->addTab('Contact');
		$emails = $tab->addTab('Email');
		$phone = $tab->addTab('Phone');

		$crud = $contact->add('xepan\base\CRUD');
		$model = $contact->add('xepan\base\Model_Contact');
		$crud->setModel($model);
		$crud->grid->addQuickSearch(['name','user']);
		$crud->grid->addPaginator(50);

		$crud = $emails->add('xepan\base\CRUD');
		$model = $emails->add('xepan\base\Model_Contact_Email');
		$crud->setModel($model);
		$crud->grid->addQuickSearch(['value']);
		$crud->grid->addPaginator(50);

		$crud = $phone->add('xepan\base\CRUD');
		$model = $phone->add('xepan\base\Model_Contact_Phone');
		$crud->setModel($model);
		$crud->grid->addQuickSearch(['value']);
		$crud->grid->addPaginator(50);


	}
}