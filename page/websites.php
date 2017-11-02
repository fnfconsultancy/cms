<?php

namespace xepan\cms;

class page_websites extends \xepan\base\Page{
		public $breadcrumb=[
						'Dashboard'=>'/','Meta Info'=>'xepan_cms_sitemetainfo'
					];

	public $title = "Website";

	function init(){
		parent::init();

		// if($s= $_GET['step']){
		// 	$s='step'.$s;
		// 	$this->$s();
		// }
	}
	
	function page_index(){

		if($_GET['step']) return;

		$template_initializer = $this->app->layout->add('Button',null,'page_top_right')->set('Initialize Template')->addClass('btn btn-primary');
		$template_initializer->js('click')->univ()->location($this->app->url('./step1'));

		// as per page 
		// http://codepen.io/kaizoku-kuma/pen/JDxtC
		$this->app->jui->addStylesheet('codemirror/codemirror-5.15.2/lib/codemirror');
		$this->app->jui->addStylesheet('codemirror/codemirror-5.15.2/theme/solarized');
		// $this->app->jui->addStylesheet('theme');

		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/lib/codemirror');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/htmlmixed/htmlmixed');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/jade/jade');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/php/php');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/xml/xml');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/css/css');
		$this->app->jui->addStaticInclude('codemirror/codemirror-5.15.2/mode/javascript/javascript');
		
		$this->js(true,'
				$("#'.$this->name.'").elfinder({
					url: "index.php?page=xepan_base_adminelconnector",
					height:450,
					commandsOptions: {
						edit : { 
							// list of allowed mimetypes to edit // if empty - any text files can be edited mimes : [],
							// you can have a different editor for different mimes 
							editors : [{
								mimes : ["text/plain", "text/html","text/x-jade", "text/javascript", "text/css", "text/x-php", "application/x-httpd-php", "text/x-markdown", "text/plain", "text/html", "text/javascript", "text/css"],
								load : function(textarea) {
									this.myCodeMirror = CodeMirror.fromTextArea(textarea, { 
																					lineNumbers: true,
																					theme: "solarized",
																					viewportMargin: Infinity, 
																					lineWrapping: true, 
																					mode:"javascript",json:true,
																					mode:"css",css:true , 
																					htmlMode: true
																				});
								},
								close : function(textarea, instance) { 
									this.myCodeMirror = null; 
								},
								save : function(textarea, editor) {
									textarea.value = this.myCodeMirror.getValue(); 
								}
							}] //editors 
						} //edit
					} //commandsOptions 
				}).elfinder("instance");
			');
	}

	function page_step1(){

		$www_absolute = getcwd().'/websites/'.$this->app->current_website_name.'/www/';
		$www_relative = './websites/'.$this->app->current_website_name.'/www/';

		if(file_exists($www_absolute . 'layout/default.html')){
			$this->add('View')->set('This template looks already initialized, please remove all folders and just unzip your HTML/Bootstrap template in www');
			return;
		}

		$html_files = glob('./websites/'.$this->app->current_website_name.'/www/*.html');
		
		array_walk($html_files, function(&$value,$key){
			$value = str_replace('./websites/'.$this->app->current_website_name.'/www/', '', $value);
		});

		$form = $this->add('Form');
		$base_file_field = $form->addField('DropDown','base_file')->setValueList(array_combine($html_files, $html_files) )->set('index.html');
		$form->addField('page_template_name')->set('default');
		
		$form->addField('DropDown','leave_un_touched')->setValueList(array_combine($html_files, $html_files))->setAttr('multiple',true);

		$form->addSubmit('Execute');

		if($form->isSubmitted()){
			$page_template_name = str_replace('.html', '', trim($form['page_template_name'])).'.html';

			if(file_exists($www_relative.'layout/'.$page_template_name))
				$form->displayError('page_template_name','File Already Exists');

			$this->app->redirect($this->app->url('./step2',['base_file'=>$form['base_file'],'page_template_name'=>$page_template_name,'leave_un_touched'=>$form['leave_un_touched'],'step'=>'2']))->execute();
		}

		
		// creating layout folder
		// read index.html (selected ?? dropdown)
		// get everything including body
			// - remove everything other than script in body 
		
		// open senitised content and let user remove js file included

		// remove title and meta keyword/description from head
		// add our own js widget atk block
		// add v-body and page-wrapper in body 
		// save as default.html (asked ?? dropdown) in layout from senitised content
		// pick every .html page in root (selected ?? checkboxes) 
			// get code in body - script tags
			// rewrite to file


		// echo "OKAY";
	}

	function page_step1_step2(){
		$www_absolute = getcwd().'/websites/'.$this->app->current_website_name.'/www/';
		$www_relative = './websites/'.$this->app->current_website_name.'/www/';
		$this->app->stickyGET('base_file');
		$this->app->stickyGET('page_template_name');
		$this->app->stickyGET('leave_un_touched');

		$this->add('View_Error')->set('Remove any jquery included, not jquery plugins but jquery itself, as system will include jquery by itself')->addClass('alert alert-danger');

		$form = $this->add('Form');
		$generated_template_field = $form->addField('xepan\base\CodeEditor','generated_template');
		$generated_template_field->load_js = true;
		$generated_template_field->show_input_only = true;
		$generated_template_field->setRows(30);

		$form->addField('hidden','base_file')->set($this->app->stickyGET('base_file'));
		$form->addField('hidden','page_template_name')->set($this->app->stickyGET('page_template_name'));
		$form->addField('hidden','leave_un_touched')->set($this->app->stickyGET('leave_un_touched'));

		$form->addSubmit('Proceed');
			
		$base_file = file_get_contents($www_relative.$_GET['base_file']);
		
		$pq = new phpQuery();
		$dom = $pq->newDocument($base_file);

		foreach ($dom['body > *']->not('script') as $body_child) {
			$pq->pq($body_child)->remove();
		}


		$template_html = $dom->html();

		$generated_template_field->set($template_html);

		if($form->isSubmitted()){
			// remove title/meta-keyword and meta-description
			$pq = new phpQuery();
			$dom = $pq->newDocument($form['generated_template']);

			$pq->pq($dom['title'])->remove();
			$pq->pq($dom['meta[name="description"]'])->remove();
			$pq->pq($dom['meta[name="keywords"]'])->remove();

			$pq->pq('<meta name="description" content="{meta_description}{/}">
					<meta name="keywords" content="{meta_keywords}{/}">
					<title>{title}xEpan CMS{/}</title>
					<!--xEpan-ATK-Header-Start
					 {$js_block}
					 {$js_include}
					 <script type="text/javascript">
					 $(function(){
					 {$document_ready}
					 });
					 </script>
					 <script src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/1.0.9/cookieconsent.min.js"></script>
					 xEpan-ATK-Header-End-->')
				->prependTo('head');

			$pq->pq('<div class="xepan-v-body xepan-component xepan-sortable-component" xepan-component-name="Main Body">
				        <div xepan-component="xepan/cms/Tool_TemplateContentRegion" class="xepan-component xepan-page-wrapper xepan-sortable-component">{$Content}</div>
				    </div>')
				->prependTo('body');

			$page_template_file = $www_relative.'layout/'.$form['page_template_name'];

			if(!file_exists($www_relative.'layout')) \Nette\Utils\FileSystem::createDir($www_relative.'layout');

			file_put_contents($page_template_file, str_replace('</body>', '</body>{$after_body_code}', $dom->html()));

			$html_files = glob('./websites/'.$this->app->current_website_name.'/www/*.html');

			$leave_un_touched = explode(",", $form['leave_un_touched']);
			
			// template model
			$template_model = $this->add('xepan\cms\Model_Template');
			$template_model->addCondition('name',$form['page_template_name']);
			$template_model->addCondition('path',$form['page_template_name']);
			$template_model->tryLoadAny();
			$template_model->save();

			foreach ($html_files as $file) {
				if(in_array($file, $leave_un_touched)) continue;
				$dom = $pq->newDocument(file_get_contents($file));
				$pq->pq($dom['body > script'])->remove();
				$content=$dom['body']->html();
				if($content){
					file_put_contents($file, $content);
					
					$page_name = end(explode("/", $file));
					$page_name = str_replace(".html", "", $page_name)

					$page_model = $this->add('xepan\cms\Model_Webpage');
					$page_model->addCondition('name',$page_name);
					$page_model->addCondition('path',$page_name);
					$page_model->tryLoadAny();
					$page_model['template_id'] = $template_model->id;
					$page_model->save();
				}
				// echo ($file."<br/>".$dom['body']->html());
			}

			$this->app->redirect($this->app->url('xepan/cms/websites'));
		}


	}
}