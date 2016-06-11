<?php


namespace xepan\cms;


class View_ToolBar extends \View {
	function init(){
		parent::init();

		$this->js(true)
				->_load('tinymce.min')
				->_load('jquery.tinymce.min')
				->_load('xepan-richtext-admin');

		$this->js(true)->_load('shortcut');

		$this->app->jui->addStaticInclude('elfinder.full');
        $this->app->jui->addStylesheet('elfinder.full');
        $this->app->jui->addStylesheet('elfindertheme');

		// $this->js(true)->_load('elfinder.full');
  //       $this->js(true)->_css('elfinder.full');
        // $this->js(true)->_css('elfindertheme');

        $this->js(true)->_css('jquery-ui');
        $this->js(true)->_css('font-awesome');

		//load style css
		$this->app->jui->addStaticStyleSheet($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/css/xepan-editing.css');
		// $this->js(true)->_css();
		$this->js(true)->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanTool.js');

		$group_tpl = $this->template->cloneRegion('group');
		$this->template->del('group');
		$tool_tpl = $this->template->cloneRegion('tool');
		$this->template->del('tool');
		$basic_property = $this->template->cloneRegion('basic_property');
		$this->template->del('basic_property');

		$tools = $this->app->getFrontEndTools();
		
		$bs_view=$this->add('xepan\cms\View_CssOptions',null,'basic_property');
		$this->add('xepan\cms\View_EditorTopBar',null,'topbar_editor');
		
		foreach (array_keys($tools) as $group) {
			$g_v = $this->add('View',null,'groups',clone $group_tpl);
			$g_v->template->set('name',$group);
			foreach ($tools[$group] as $tool) {
				$t_v = $g_v->add($tool,null,'tools');
				$t_v->getOptionPanel($this,'tool_options');
				$t_v_icon = $g_v->add('View',null,'tools',clone $tool_tpl);
				$tool_arr = explode("\\", $tool);
				$tool_name = array_pop($tool_arr);
				$tool_name = str_replace("Tool_", '', $tool_name);
				$t_v_icon->template->set('name',$tool_name);
				$t_v_icon->template->set('namespace',implode("/", $tool_arr));
				$t_v_icon->js(true)->xepanTool(
					[
					'name'=>$tool,
					'drop_html'=> $t_v->runatServer ? '<div class="xepan-component xepan-serverside-component" xepan-component="'.str_replace('\\', '/', get_class($t_v)).'">' .$t_v->getHTML(). '</div>': $t_v->getHTML()
					]
				);
			}

			$g_v->template->del('tools');
		}
		
		// ========= Widget Tools from Template =========
		$g_v = $this->add('View',null,'groups',clone $group_tpl);
		$g_v->template->set('name','Template Widgets');
		$path = 'widget/';

		if(file_exists(realpath("./websites/".$this->app->epan['name']."/www/".$path))){
			foreach (new \DirectoryIterator("./websites/".$this->app->epan['name']."/www/".$path) as $fileInfo) {
				$file_name=$fileInfo->getFilename();
				$temp_array=explode('.',$file_name);
				if($temp_array[1]!="html")continue;
				$subject = $temp_array[0];
				$pattern = "/_options/";
				preg_match($pattern,$subject, $matches, PREG_OFFSET_CAPTURE);
				if($matches)continue;
			    if($fileInfo->isDot()) continue;
			    $file =  $path.$fileInfo->getFilename();
				$temp=str_replace('.html',"",$file);
			    $t_v=$g_v->add('xepan\cms\View_Tool',['runatServer'=>false],'tools',[$temp]);
				$this->add('View',null,'tool_options',[strtolower($temp).'_options']);
				$wt=explode("/",$temp);
				$t_v_icon = $g_v->add('View',null,'tools')->setHtml('<img src="./websites/'.$this->app->epan['name'].'/www/widget/'.$wt[1].'_icon.png"/><br/>'.$wt[1])->addClass(' col-md-4 col-sm-4 col-xs-4 text-center');
				$t_v_icon->js(true)->xepanTool(
						[
						'name'=>$tool,
						'drop_html'=> $t_v->getHTML()
						]
					);
			}
			$g_v->template->del('tools');
		}

		$this->js(true)
			->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanComponent.js')
			->_load($this->api->url()->absolute()->getBaseURL().'vendor/xepan/cms/templates/js/xepanEditor.js')
			->insertAfter('body')
			->xepanEditor([
				'base_url'=>$this->api->url()->absolute()->getBaseURL(),
				'file_path'=>$this->app->page_object instanceof \xepan\cms\page_cms?$this->app->page_object->template->origin_filename:'false',
				'template'=>$this->app->page_object instanceof \xepan\cms\page_cms?$this->app->template->origin_filename:'false',
				'save_url'=> $this->api->url()->absolute()->getBaseURL().'?page=xepan/cms/admin/save_page&cut_page=1'
			])->_selector('.xepan-toolbar');
		$this->js(true)->insertAfter('body')->_selector('.xepan-tools-options');
		$this->js(true)->xepanComponent()->_selector('body .xepan-component');
		// $this->js(true)->resizable()->_selector('.xepan-toolbar');
	}

	function defaultTemplate(){
		return ['view/cms/toolbar/layout'];
	}
}
