<?php

namespace xepan\cms;

class page_cmspagemanager extends \xepan\base\Page{
	
	public $title = "Website Pages and Templates";
	
	function init(){
		parent::init();

		$this->app->muteACL = true;

		$tab = $this->add('TabsDefault');
		$page_tab = $tab->addTab('Page');
		$temp_tab = $tab->addTab('Template');
		$meta_tab = $tab->addTab('Default Meta Info');
		
		// Website Template
		$template = $temp_tab->add('xepan\cms\Model_Template');
		$crud = $temp_tab->add('xepan\hr\CRUD');
		$crud->form->add('xepan\base\Controller_FLC')
					->layout([
							'name'=>'Page Info~c1~4',
							'path'=>'c2~6',
							'page_title'=>'Meta Info, Overrides Default Info~c1~12',
							'meta_kewords'=>'c2~12',
							'meta_description'=>'c3~12',
							'after_body_code'=>'Any Code to insert after body tag~c1~12~Mainly used for analytical purpose'
						]
						);
		$crud->setModel('xepan\cms\Template',['name','path','page_title','meta_kewords','meta_description','after_body_code'],['name','path']);
		/*Start Live Edit Template */
		$crud->grid->addColumn('Button','live_edit_template');
		$crud->grid->addMethod('format_live_edit_template',function($g,$f){
			$url =$this->app->url('layout/'.$g->model['name'],['xepan-template-edit'=>"layout/".$g->model['name']]);	
			$url = str_replace('/admin/',"/",$url);
			$g->current_row_html['live_edit_template']= '<a href="javascript:void(0)" onclick="'.$g->js()->univ()->newWindow($url).'"><span class="btn btn-success">Live Edit</span></a>';
		});
		$crud->grid->addFormatter('live_edit_template','live_edit_template');
		/*END Live Edit Template */

		// // Website Pages
		$page = $page_tab->add('xepan\cms\Model_Page');
		$crud = $page_tab->add('xepan\hr\CRUD');
		$crud->form->add('xepan\base\Controller_FLC')
					->layout([
							'template_id'=>'Template~c1~12',
							'name'=>'Page Info~c1~4',
							'path'=>'c2~6',
							'is_muted~'=>'c3~2~<br/>Hidden in menu?',
							'page_title'=>'Meta Info, Overrides Default Info~c1~12',
							'meta_kewords'=>'c2~12',
							'meta_description'=>'c3~12',
							'after_body_code'=>'Any Code to insert after body tag~c1~12~Mainly used for analytical purpose'
						]
						);
		$crud->setModel($page,['template_id','name','path','is_muted','page_title','meta_kewords','meta_description','after_body_code'],['template','name','path','is_muted']);

		$crud->grid->addColumn('Button','live_edit_page');
		$crud->grid->addMethod('format_live_edit_page',function($g,$f){
			$url =$this->app->url($g->model['path']);	
			$url = str_replace('/admin/',"/",$url);
			$url = str_replace('.html',"",$url);
			$g->current_row_html['live_edit_page']= '<a href="javascript:void(0)" onclick="'.$g->js()->univ()->newWindow($url).'"><span class="btn btn-success">Live Edit</span></a>';
		});
		$crud->grid->addFormatter('live_edit_page','live_edit_page');
		/*END Live Edit Page */

		$epan = $this->add('xepan\epanservices\Model_Epan')->load($this->app->epan->id);
		$extra_info = json_decode($epan['extra_info'],true);

		$form = $meta_tab->add('Form');
		$form->add('xepan\base\Controller_FLC')
			->layout([
					'title'=>'Meta Info~c1~12',
					'meta_keyword'=>'c2~12',
					'meta_description'=>'c3~12',
					'after_body_code'=>'c4~12~Mainly used for analytical purpose',
				]);
		$form->addField('title')->set($extra_info['title']);
		$form->addField('meta_keyword')->set($extra_info['meta_keyword']);
		$form->addField('text','meta_description')->set($extra_info['meta_description'])->addClass('xepan-push');
		$form->addField('text','after_body_code')->set($extra_info['after_body_code'])->addClass('xepan-push');
		$form->addSubmit('Save')->addClass('btn btn-primary btn-block');

		if($form->isSubmitted()){
			$extra_info['title'] = $form['title']; 
			$extra_info['meta_keyword'] = $form['meta_keyword'];
			$extra_info['meta_description'] = $form['meta_description'];
			$extra_info['after_body_code'] = $form['after_body_code'];

			$epan['extra_info'] = json_encode($extra_info);
			$epan->save();
			return $form->js()->univ()->successMessage('Done')->execute();
		}

	}
}