<?php

namespace xepan\cms;

class page_theme extends \xepan\base\Page{
	public $title = "Themes";

	public $epan_template;

	function init(){
		parent::init();

		$this->app->readConfig("websites/www/config.php");
        $this->app->dbConnect();
        $epan_template = $this->epan_template = $this->app->db->dsql()->table('epan')->where('is_published',1)->where('is_template',1)->get();
        $temp = [];
        foreach ($epan_template as $key => $array) {
        	$temp[$array['id']] = $array;
        }
        $this->epan_template = $temp;

        $grid = $this->add('Grid');
        $grid->setSource($this->epan_template);
        $grid->addColumn('name');
        $grid->addColumn('ApplyNow');
        $grid->addColumn('preview');

        $url = "{$_SERVER['HTTP_HOST']}";
        $domain = str_replace('www.','',$this->app->extract_domain($url))?:'www';
        $sub_domain = str_replace('www.','',$this->app->extract_subdomains($url))?:'www';

        $grid->addHook('formatRow',function($g)use($domain,$sub_domain){
			$g->current_row_html['preview'] = '<a class="btn btn-primary" target="_blank" href="http://www.'.$g->model['name'].'.'.$domain.'">Preview</a>';
		});

		$grid->add('VirtualPage')
			->addColumn('ApplyNow')
			->set(function($page){
				$id = $_GET[$page->short_name.'_id'];				
				
				$form = $page->add('Form');
				$form->add('View')->set('are you sure, installing new theme will remove all content ?')->addClass('alert alert-info');
				$form->addSubmit('Yes, Install Theme');
				if($form->isSubmitted()){
					$js_event = [];
					try{
						$selected_template = $this->epan_template[$id];
						if(!file_exists(realpath($this->app->pathfinder->base_location->base_path.'/websites/'.$selected_template['name']))){
							throw $this->exception('Template not found')
										->addMoreInfo('epan',$selected_template['name']);
						}

						// first delete folder
						$new_name = uniqid('www-').'-'.$this->app->now;
						if(file_exists(realpath($this->app->pathfinder->base_location->base_path.'/websites/'.$this->app->current_website_name.'/www'))){
							\Nette\Utils\FileSystem::rename('./websites/'.$this->app->current_website_name.'/www','./websites/'.$this->app->current_website_name.'/'.$new_name);
						}
						// \Nette\Utils\FileSystem::delete('./websites/www/www');
						$fs = \Nette\Utils\FileSystem::createDir('./websites/'.$this->app->current_website_name.'/www');
						$fs = \Nette\Utils\FileSystem::copy('./websites/'.$selected_template['name'].'/www','./websites/'.$this->app->current_website_name.'/www',true);
						
						$js_event[] = $form->js()->univ()->location()->reload();
					}catch(\Exception $e){
						$js_event[] = $form->js()->univ()->errorMessage("theme not apply, ".$e->getMessage());
					}
					
					$form->js(null,$js_event)->execute();
				}
			});

	}
}