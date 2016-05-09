<?php


namespace xepan\cms;


class Controller_ServerSideComponentManager extends \AbstractController {
	public $spots= 1;
	function init(){
		parent::init();
		$this->createSpots();
		$this->renderServerSideComponents();
	}

	function createSpots(){
		// TODO :: Some caching ??		
		$this->dom = $dom = \pQuery::parseStr($this->owner->template->template_source);
		foreach($dom->query('.xepan-component') as $d){
			if(!$d->hasClass('xepan-serverside-component')) continue;
			$i= $this->spots++;
			$inner_html = $d->html();
			$with_spot = '{'.$this->owner->template->name.'_'.$i.'}'. $inner_html.'{/}';
			$d->html($with_spot);
		}
		
		if(isset($this->app->isEditing) && $this->app->isEditing){
			$dom->html($dom->html().'{$xepan_toolbox_spot}');
		}

		$this->owner->template->loadTemplateFromString($dom->html());

	}

	function renderServerSideComponents(){
		$dom = $this->dom;
		$this->spots=1;
		foreach($dom->query('.xepan-component') as $d){
			if(!$d->hasClass('xepan-serverside-component')) continue;
			$i= $this->spots++;
			$this->owner->add($d->attr('xepan-component'),['_options'=>$d->attributes],$this->owner->template->name.'_'.$i);
		}
	}
}