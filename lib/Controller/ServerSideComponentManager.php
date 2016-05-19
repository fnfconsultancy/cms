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

		$this->pq = $pq = new phpQuery();
		$this->dom = $dom = $pq->newDocument($this->owner->template->template_source);

		if(!$this->owner instanceof \Frontend){
			$pq->pq($dom)->attr('xepan-page-content','true');
			$pq->pq($dom)->addClass('xepan-page-content');			
		}

		foreach($dom['.xepan-component'] as $d){
			$d=$pq->pq($d);
			if(!$d->hasClass('xepan-serverside-component')) continue;
			$i= $this->spots++;
			$inner_html = $d->html();
			$with_spot = '{'.$this->owner->template->name.'_'.$i.'}'. $inner_html.'{/}';
			$d->html($with_spot);
		}
		
		$content = $this->updateBaseHrefForTemplates();
		$this->owner->template->loadTemplateFromString($content);

	}

	function renderServerSideComponents(){
		$dom = $this->dom;
		$this->spots=1;
		foreach($dom['.xepan-component'] as $d){
			$attributes=[];
			foreach ($d->attributes as $attr) {
				$attributes[$attr->name] = $attr->value;
			}
			$d=$this->pq->pq($d);
			if(!$d->hasClass('xepan-serverside-component')) continue;
			$i= $this->spots++;
			$this->owner->add($d->attr('xepan-component'),['_options'=>$attributes],$this->owner->template->name.'_'.$i);
		}
	}

	function updateBaseHrefForTemplates(){
		
		$dom = $this->dom;

		if(strpos(realpath($this->owner->template->origin_filename), 'xepantemplates'))
			$domain = $this->app->pm->base_url.$this->app->pm->base_path.'xepantemplates/'.$this->app->getConfig('xepan-template').'/';
		else
			$domain = $this->app->pm->base_url.$this->app->pm->base_path.'websites/'.$this->app->current_website_name.'/www/';

		foreach ($dom['img']->not('[src^="http"]') as $img) {
			$img= $this->pq->pq($img);
			$img->attr('src',$domain.$img->attr('src'));
		}

		foreach ($dom['link']->not('[href^="http"]') as $img) {
			$img= $this->pq->pq($img);
			$img->attr('href',$domain.$img->attr('href'));
		}

		foreach ($dom['script[src]']->not('[src^="http"]')->not('[src^="//"]') as $img) {
			$img= $this->pq->pq($img);
			$img->attr('src',$domain.$img->attr('src'));
		}

		// $content = preg_replace("/(link.*|img.*|script.*)(href|src)\s*\=\s*[\"\']([^(http)])(\/)?/", "$1$2=\"$domain$3", $content);
		$content = preg_replace('/url\(\s*[\'"]?\/?(.+?)[\'"]?\s*\)/i', 'url('.$domain.'$1)', $dom->html());

		return $content;
	}
}