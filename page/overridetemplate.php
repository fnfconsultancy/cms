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

		$tool = $this->add($_GET['xepan-tool-to-clone']);
		
		if(!$tool->teplateOverridable){
			$this->add('View')->set('You cannot override template for this tool');
			return;
		}
		$original_path = $tool->template->origin_filename;
		$tool->destroy();

		$specific_path = substr($original_path, strpos($original_path,'/templates/')+strlen('/templates/'));
		$override_path = $this->app->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name.'/www/'.$specific_path;

		if(file_exists($override_path)){
			$this->add('View')->set('File allrealy overrided at "'. $specific_path.'", Please remove this file and click again to reset');
			return;
		}

		$fs = \Nette\Utils\FileSystem::copy($original_path,$override_path,true);
		$this->add('View')->set('Tool template is overrided at "'.$specific_path.'", PLease use file manager in admin to edit file');
	}
}
