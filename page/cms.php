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


	function init(){
		parent::init();

		// $this->api->addHook('post-init',[$this,'createSpots']);		
		// $this->api->addHook('post-init',[$this,'renderServerSideComponents']);

		$this->createSpots();
		$this->renderServerSideComponents();

		if($this->app->isEditing){
			$this->api->addHook('pre-render',[$this,'createEditingEnvironment']);			
		}
		
	}

	function createSpots(){
		// TODO :: Some caching ??
		$this->dom = $dom = \pQuery::parseStr($this->template->template_source);
		foreach($dom->query('.xepan-component') as $d){
			$i= $this->spots++;
			$inner_html = $d->html();
			$with_spot = '{_xepan_spot_'.$i.'}'. $inner_html.'{/}';
			$d->html($with_spot);
		}
		
		if($this->app->isEditing){
			$dom->html($dom->html().'{$xepan_toolbox_spot}');
		}

		$this->template->loadTemplateFromString($dom->html());

	}

	function renderServerSideComponents(){
		$dom = $this->dom;
		$this->spots=1;
		foreach($dom->query('.xepan-component') as $d){
			$i= $this->spots++;
			$this->add($d->attr('xepan-component'),['_options'=>$d->attributes],'_xepan_spot_'.$i);
		}
	}

	function createEditingEnvironment(){
		// $this->js(true)->_selector('.xepan-edittext')->attr('contenteditable','true');
	}

	/**
	 * Code from generation 1
	 */
	function __Plugins_RunServerSideComponent($obj, $page){
		include_once (getcwd().'/lib/phpQuery.php');
		$pq = new \phpQuery();
		$doc = $pq->newDocument($page['content']);
		
		$server = $doc['[data-is-serverside-component=true]'];
		foreach($doc['[data-is-serverside-component=true]'] as $ssc){
			$options = array();
			foreach ($ssc->attributes as $attrName => $attrNode) {
    			$options[$attrName] = $pq->pq($ssc)->attr($attrName);
			}

			$namespace =  $pq->pq($ssc)->attr('data-responsible-namespace');
			$view =  $pq->pq($ssc)->attr('data-responsible-view');
			if(!file_exists($path = getcwd().DS.'epan-components'.DS.$namespace.DS.'lib'.DS.'View'.DS.'Tools'.DS.str_replace("View_Tools_", "", $view) .'.php'))
				$temp_view = $this->owner->add('View_Error')->set("Server Side Component Not Found :: $namespace/$view");
			else{
				$temp_view = $this->owner->add("$namespace/$view",array('html_attributes'=>$options,'data_options'=>$pq->pq($ssc)->attr('data-options')));
			}
			if(!$_GET['cut_object'] and !$_GET['cut_page']){
				$html = $temp_view->getHTML();
				$pq->pq($ssc)->html("")->append($html);
			}
		}
		$page['content'] = $doc->htmlOuter();
	}
}
