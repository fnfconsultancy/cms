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

		$this->updateBaseHrefForTemplates();
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

	function updateBaseHrefForTemplates(){
		// var_dump($this->dom->html());
		// 	exit();
		
		$dom = $this->dom;

		$content = $this->dom->html();
		$domain = $this->app->pm->base_url.$this->app->pm->base_path.'websites/'.$this->app->current_website_name.'/';

		// $rep['/href="(?!https?:\/\/)(?!data:)(?!#)/'] = 'href="'.$domain;
		// $rep['/src="(?!https?:\/\/)(?!data:)(?!#)/'] = 'src="'.$domain;
		// $rep['/@import[\n+\s+]"\//'] = '@import "'.$domain;
		// $rep['/@import[\n+\s+]"\./'] = '@import "'.$domain;
		// $content = preg_replace(
		//     array_keys($rep),
		//     array_values($rep),
		//     $content
		// );
		$content = preg_replace("/(link.*|img.*)(href|src)\s*\=\s*[\"\']([^(http)])(\/)?/", "$1$2=\"$domain$3", $content);

		$content = preg_replace('/url\(\s*[\'"]?\/?(.+?)[\'"]?\s*\)/i', 'url('.$domain.'$1)', $content);

		$dom->html($content);

	}
}