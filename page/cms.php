<?php

/**
* description: xEpan CMS Page runner. 
* 
* @author : Gowrav Vishwakarma
* @email : gowravvishwakarma@gmail.com, info@xavoc.com
* @website : http://xepan.org
* 
*/

namespace xepan\cms;

use \tburry;


class page_cms extends \Page {
	public $title='';

	public $dom;

	public $spots=1;
	public $page_requested=null;

	function init(){
		parent::init();

		if($this->page_requested){
			$this->app->template->trySet('title',$this->page_requested);
		}

		// $this->api->addHook('post-init',[$this,'createSpots']);		
		// $this->api->addHook('post-init',[$this,'renderServerSideComponents']);

		$this->add('xepan\cms\Controller_ServerSideComponentManager');
		
		if($this->app->isEditing){
			$this->api->addHook('pre-render',[$this,'createEditingEnvironment']);			
		}
	}


	function createEditingEnvironment(){
        $this->app->add('xepan\cms\View_ToolBar');
	}
}
