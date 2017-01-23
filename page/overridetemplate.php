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

		$tool = $this->add($this->api->stickyGET('xepan-tool-to-clone'));

		if(!$tool->teplateOverridable){
			$this->add('View')->set('You cannot override template for this tool');
			return;
		}

		$tool_options = json_decode($this->api->stickyGET('options'));

		$original_path = $tool->getTemplateFile($tool_options);

		$tool->destroy();

		$specific_path = substr($original_path, strpos($original_path,'/templates/')+strlen('/templates/'));
		$override_path = $this->app->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name.'/www/'.$specific_path;

		if(!file_exists($override_path)){
			$fs = \Nette\Utils\FileSystem::copy($original_path,$override_path,true);
			// $this->add('View')->set('File allrealy overrided at "'. $specific_path.'", Please remove this file and click again to reset');
			// return;
		}

		$f = $this->add('Form');
		$field = $f->addField('xepan\base\CodeEditor','content')->set(file_get_contents($override_path));
		$field->lang='html';

		$this->add('View')->set('Tool template is overrided at "'.$specific_path.'", PLease use file manager in admin to edit file');
	}
}
