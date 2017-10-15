<?php

/**
* description: ATK Page
* 
* @author : Gowrav Vishwakarma
* @email : gowravvishwakarma@gmail.com, info@xavoc.com
* @website : http://xepan.org
* 
*/

namespace xepan\cms;


class page_overridetemplate extends \Page {
	
	public $title='Over Ride template';

	function init(){
		parent::init();

		if(!$this->app->auth->isLoggedIn()) return;
		if(!$_GET['xepan-tool-to-clone']){
			return $this->add('View')->set('Please select a tool');
		}	

		$tool_options = json_decode($this->api->stickyGET('options'),true);

		$tool = $this->add($this->api->stickyGET('xepan-tool-to-clone'),['_options'=>$tool_options]);

		if(!$tool->templateOverridable){
			$this->add('View')->set('You cannot override template for this tool');
			return;
		}


		$original_path = $tool->getTemplateFile();


		if(strpos($original_path, '/websites/'.$this->app->current_website_name.'/www/') !== false){
			$override_path = $original_path;
		}else{
			$relative_path = substr($original_path, strpos($original_path,'/templates/')+strlen('/templates/'));
			$override_path = $this->app->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name.'/www/'.$relative_path;
		}

		if(!file_exists($override_path)){
			$fs = \Nette\Utils\FileSystem::copy($original_path,$override_path,true);
			// $this->add('View')->set('File allrealy overrided at "'. $relative_path.'", Please remove this file and click again to reset');
			// return;
		}

		$tabs = $this->add('TabsDefault');
		$edit_tab = $tabs->addtab('Edit');
		$original_tab = $tabs->addtab('Original');
		
		$f = $edit_tab->add('Form');
		$f->add('View_Info')->set($override_path);
		$field = $f->addField('xepan\base\CodeEditor','content')->set(file_get_contents($override_path));
		$field->lang='html';
		$field->setRows(20);

		$f->addSubmit('Save');

		if($f->isSubmitted()){
			file_put_contents($override_path, $f['content']);
			$f->js()->univ()->successMessage('Saved at '. $override_path)->execute();
		}

		$class = new \ReflectionClass($tool);

		$original_file = getcwd(). '/vendor/'.str_replace("\\", "/", $class->getNamespaceName()).'/templates/'.$tool->getDefaultTemplate().'.html';
		
		if(!file_exists($original_file)) $original_file = $override_path;

		$original_tab->add('View')->set(file_get_contents($original_file));


		$tool->destroy();
	}
}
