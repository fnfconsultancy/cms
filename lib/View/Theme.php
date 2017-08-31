<?php
namespace xepan\cms;

class View_Theme extends \View{
	public $epan_template;
	public $apply_theme_on_website;
	public $apply_theme_on_website_id=0;
	public $dashboard_page = "customer-dashboard";

	function init(){
		parent::init();

		$this->app->readConfig('websites/www/config.php');
		// $this->app->readConfig('websites/'.$this->app->current_website_name.'/config.php');
        $this->app->dbConnect();
        $epan_template = $this->epan_template = $this->app->db->dsql()->table('epan')->where('is_published',1)->where('is_template',1)->get();
        $temp = [];
        foreach ($epan_template as $key => $array) {
        	$temp[$array['id']] = $array;
        }
        $this->epan_template = $temp;

        $grid = $this->add('xepan\hr\Grid',null,null,['grid/theme'])->addClass('xepan-theme-grid');
        $grid->setSource($this->epan_template);
        $grid->addColumn('name');
        $grid->addColumn('preview_image');
        $grid->addColumn('ApplyNow');
        $grid->addColumn('preview');
        $grid->addQuickSearch(['name']);

        $this->url = $url = "{$_SERVER['HTTP_HOST']}";
        $this->domain = $domain = str_replace('www.','',$this->app->extract_domain($url))?:'www';
        $this->sub_domain = $sub_domain = str_replace('www.','',$this->app->extract_subdomains($url))?:'www';
        
        $grid->addHook('formatRow',function($g)use($domain,$sub_domain){
			$g->current_row_html['preview'] = '<a class="btn btn-primary" target="_blank" href="http://www.'.$g->model['name'].'.'.$domain.'">Preview</a>';
			$g->current_row_html['preview_image'] = '<div style="height:250px;overflow:auto;"><a target="_blank" href="http://www.'.$g->model['name'].'.'.$domain.'"><img alt=" we are uploading preview image of '.$g->model['name'].'" style="width:250px;" src="./websites/'.$g->model['name'].'/www/img/template_preview.png" /></img></a></div>';
		});

		$grid->add('VirtualPage')
			->addColumn('ApplyNow')
			->set(function($page){
				$id = $_GET[$page->short_name.'_id'];
				
				if(!$id){
					$page->add('View')->set('some thing went wrong.')->addClass('alert alert-danger');
					return;
				}
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

						$apply_theme_epan_name = $this->app->current_website_name;
						if($this->apply_theme_on_website){
							$apply_theme_epan_name = $this->apply_theme_on_website;
						}

						// first delete folder
						$new_name = uniqid('www-').'-'.$this->app->now;
						if(file_exists(realpath($this->app->pathfinder->base_location->base_path.'/websites/'.$apply_theme_epan_name.'/www'))){
							\Nette\Utils\FileSystem::rename('./websites/'.$apply_theme_epan_name.'/www','./websites/'.$apply_theme_epan_name.'/'.$new_name);
						}
						// \Nette\Utils\FileSystem::delete('./websites/www/www');
						$fs = \Nette\Utils\FileSystem::createDir('./websites/'.$apply_theme_epan_name.'/www');
						$fs = \Nette\Utils\FileSystem::copy('./websites/'.$selected_template['name'].'/www','./websites/'.$apply_theme_epan_name.'/www',true);
						
						if($this->apply_theme_on_website_id){
							$js_event =[
									$form->js()->univ()->newWindow($apply_theme_epan_name.".".$this->domain),
									$form->js()->univ()->location($this->app->url($this->dashboard_page))
								];
						}else{
							$js_event[] = $form->js()->univ()->location()->reload();
						}
					}catch(\Exception $e){
						$js_event[] = $form->js()->univ()->errorMessage("theme not apply, ".$e->getMessage());
					}
					
					$form->js(null,$js_event)->execute();
				}
			});
	}
}